"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { Task, TaskLabel, TaskPriority, TaskStatus } from "@/data/schema"
import { useAdapter, useKitMutation } from "@/kit/data/hooks"
import { currentTime } from "@/lib/clock"
import type { Resources } from "@/lib/data"

import { ASSIGNEE_OPTIONS, LABELS, PRIORITIES, STATUSES } from "./task-meta"

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the task a title of at least 3 characters.")
    .max(120, "Keep the title under 120 characters."),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  label: z.enum(["bug", "feature", "improvement", "docs", "chore"]),
  assignee: z.string(),
  due: z.string(),
})

type Values = z.infer<typeof schema>

function ChoiceField<V extends string>({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: V
  onChange: (value: V) => void
  options: {
    value: V
    label: string
    icon?: React.ComponentType<{ className?: string }>
    tone?: string
  }[]
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        value={value}
        onValueChange={(next) => next && onChange(next as V)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => {
              const Icon = option.icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  {Icon && <Icon className={option.tone} />}
                  {option.label}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

/**
 * A new task, created through the adapter and then moved to the top of its
 * column with the `tasks.move` action, so it appears where you will look.
 */
export function CreateTaskDialog({
  open,
  onOpenChange,
  initialStatus = "todo",
  nextKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialStatus?: TaskStatus
  /** The key the new task gets, e.g. "TW-176". */
  nextKey: string
}) {
  const adapter = useAdapter<Resources>()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      status: initialStatus,
      priority: "medium",
      label: "feature",
      assignee: "none",
      due: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        status: initialStatus,
        priority: "medium",
        label: "feature",
        assignee: "none",
        due: "",
      })
    }
  }, [open, initialStatus, form])

  const create = useKitMutation(
    async (values: Values): Promise<Task> => {
      const task = await adapter.create("tasks", {
        key: nextKey,
        title: values.title.trim(),
        status: values.status,
        priority: values.priority as TaskPriority,
        label: values.label as TaskLabel,
        assigneeId: values.assignee === "none" ? null : values.assignee,
        due: values.due || null,
        createdAt: currentTime().toISOString(),
        rank: 0,
      })
      return adapter.action<Task>("tasks", "move", {
        id: task.id,
        status: task.status,
        index: 0,
      })
    },
    {
      invalidate: ["tasks"],
      success: (task) => ({
        title: `${task.key} created`,
        description: task.title,
      }),
      error: "Could not create the task",
    }
  )

  const submit = form.handleSubmit((values) =>
    create.mutate(values, { onSuccess: () => onOpenChange(false) })
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Added to the top of its column as{" "}
              <span className="font-mono text-foreground">{nextKey}</span>.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="task-title">Title</FieldLabel>
                  <Input
                    id="task-title"
                    autoFocus
                    placeholder="Show seat usage on the account page"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <ChoiceField
                    id="task-status"
                    label="Status"
                    value={field.value}
                    onChange={field.onChange}
                    options={STATUSES}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <ChoiceField
                    id="task-priority"
                    label="Priority"
                    value={field.value}
                    onChange={field.onChange}
                    options={PRIORITIES}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="label"
                render={({ field }) => (
                  <ChoiceField
                    id="task-label"
                    label="Label"
                    value={field.value}
                    onChange={field.onChange}
                    options={LABELS}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <ChoiceField
                    id="task-assignee"
                    label="Assignee"
                    value={field.value}
                    onChange={field.onChange}
                    options={ASSIGNEE_OPTIONS}
                  />
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="due"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="task-due">Due date</FieldLabel>
                  <Input
                    id="task-due"
                    type="date"
                    className="sm:w-1/2"
                    {...field}
                  />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner data-icon="inline-start" />}
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
