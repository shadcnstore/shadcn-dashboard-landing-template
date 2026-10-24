"use client"

import { ChevronDownIcon, ListTodoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import type { Task, TaskPriority, TaskStatus } from "@/data/schema"
import type { ListResult, SortRule } from "@/kit/data/list"
import { DataTable, type DataColumn } from "@/kit/data-table/data-table"
import { DataTablePagination } from "@/kit/data-table/pagination"
import { EmptyState } from "@/kit/ui-patterns/query-state"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { cn } from "@/lib/utils"

import { DueDate, PriorityIcon } from "./task-card"
import {
  LABEL_BY_VALUE,
  PRIORITIES,
  PRIORITY_BY_VALUE,
  STATUS_BY_VALUE,
  STATUSES,
} from "./task-meta"
import { TEAM_BY_ID, TeamAvatar } from "./team-avatar"

export type TaskPatch = {
  id: string
  patch: Partial<Pick<Task, "status" | "priority">>
}

function InlineChoice<V extends string>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string
  value: V
  options: {
    value: V
    label: string
    icon: React.ComponentType<{ className?: string }>
    tone: string
  }[]
  onChange: (value: V) => void
  compact?: boolean
}) {
  const current = options.find((option) => option.value === value)!
  const Icon = current.icon
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("-ms-2 gap-1.5 px-2 font-normal", compact && "h-7")}
            aria-label={`${label}: ${current.label}. Change`}
          />
        }
      >
        <Icon className={current.tone} />
        <span className={cn(compact && "sr-only sm:not-sr-only")}>
          {current.label}
        </span>
        <ChevronDownIcon
          data-icon="inline-end"
          className="text-muted-foreground opacity-0 transition-opacity group-hover/button:opacity-100 [tr:hover_&]:opacity-100"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => next !== value && onChange(next as V)}
          >
            {options.map((option) => {
              const OptionIcon = option.icon
              return (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <OptionIcon className={option.tone} />
                  {option.label}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TaskTable({
  result,
  loading,
  sort,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onPatch,
  onClear,
  filtered,
}: {
  result: ListResult<Task> | undefined
  loading: boolean
  sort: SortRule[]
  onSortChange: (sort: SortRule[]) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onPatch: (input: TaskPatch) => void
  onClear: () => void
  filtered: boolean
}) {
  const setStatus = (task: Task, status: TaskStatus) =>
    onPatch({ id: task.id, patch: { status } })
  const setPriority = (task: Task, priority: TaskPriority) =>
    onPatch({ id: task.id, patch: { priority } })

  const columns: DataColumn<Task>[] = [
    {
      id: "key",
      header: "Task",
      sortId: "key",
      hideable: false,
      className: "w-24",
      cell: (task) => (
        <span className="font-mono text-xs text-muted-foreground">
          {task.key}
        </span>
      ),
    },
    {
      id: "title",
      header: "Title",
      hideable: false,
      cell: (task) => {
        const label = LABEL_BY_VALUE.get(task.label)!
        return (
          <span className="flex min-w-0 items-center gap-2">
            <StatusBadge
              tone={label.tone}
              className="h-5 shrink-0 px-1.5 text-[11px]"
            >
              {label.label}
            </StatusBadge>
            <span
              className={cn(
                "truncate font-medium",
                task.status === "done" &&
                  "text-muted-foreground line-through decoration-muted-foreground/50"
              )}
            >
              {task.title}
            </span>
          </span>
        )
      },
      className: "max-w-0 w-full",
    },
    {
      id: "status",
      header: "Status",
      className: "w-36",
      cell: (task) => (
        <InlineChoice
          label="Status"
          value={task.status}
          options={STATUSES}
          onChange={(status) => setStatus(task, status)}
        />
      ),
    },
    {
      id: "priority",
      header: "Priority",
      sortId: "priority",
      className: "w-32",
      cell: (task) => (
        <InlineChoice
          label="Priority"
          value={task.priority}
          options={PRIORITIES}
          onChange={(priority) => setPriority(task, priority)}
        />
      ),
    },
    {
      id: "assignee",
      header: "Assignee",
      className: "w-40",
      cell: (task) => {
        const member = task.assigneeId ? TEAM_BY_ID.get(task.assigneeId) : null
        return (
          <span className="flex items-center gap-2">
            <TeamAvatar member={member} tooltip={false} />
            <span
              className={cn(
                "truncate text-sm",
                !member && "text-muted-foreground"
              )}
            >
              {member ? member.name.split(" ")[0] : "Unassigned"}
            </span>
          </span>
        )
      },
    },
    {
      id: "due",
      header: "Due",
      sortId: "due",
      className: "w-28 pe-4",
      cell: (task) =>
        task.due ? (
          <DueDate task={task} />
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        label="Tasks"
        columns={columns}
        rows={result?.rows}
        getRowId={(task) => task.id}
        loading={loading && !result}
        sort={sort}
        onSortChange={onSortChange}
        renderMobileRow={(task) => {
          const status = STATUS_BY_VALUE.get(task.status)!
          const priority = PRIORITY_BY_VALUE.get(task.priority)!
          return (
            <Item
              variant="muted"
              className="items-start rounded-xl bg-card shadow-(--surface-shadow)"
            >
              <ItemContent className="min-w-0">
                <ItemDescription className="flex items-center gap-2 font-mono text-xs">
                  {task.key}
                  <PriorityIcon task={task} />
                  <span className="sr-only">{priority.label}</span>
                  <DueDate task={task} />
                </ItemDescription>
                <ItemTitle className="line-clamp-2">{task.title}</ItemTitle>
              </ItemContent>
              <ItemActions className="flex-col items-end gap-1">
                <InlineChoice
                  label="Status"
                  value={status.value}
                  options={STATUSES}
                  onChange={(next) => setStatus(task, next)}
                  compact
                />
                <TeamAvatar
                  member={
                    task.assigneeId ? TEAM_BY_ID.get(task.assigneeId) : null
                  }
                />
              </ItemActions>
            </Item>
          )
        }}
        empty={
          <EmptyState
            icon={ListTodoIcon}
            title={filtered ? "No tasks match" : "No tasks yet"}
            description={
              filtered
                ? "Try another search or clear the filters."
                : "Create the first task to start the backlog."
            }
            className="rounded-2xl border bg-card"
            action={
              filtered ? (
                <Button variant="outline" onClick={onClear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        }
      />
      {result && result.total > 0 && (
        <DataTablePagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          pageCount={result.pageCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
