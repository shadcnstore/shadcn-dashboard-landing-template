import { CalendarIcon } from "lucide-react"

import type { Task } from "@/data/schema"
import { formatDate } from "@/kit/data/format"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { currentTime } from "@/lib/clock"
import { cn } from "@/lib/utils"

import { LABEL_BY_VALUE, PRIORITY_BY_VALUE } from "./task-meta"
import { TEAM_BY_ID, TeamAvatar } from "./team-avatar"

/** "Overdue" before today, "Due soon" within two days. */
export function dueState(
  due: string | null,
  done: boolean
): "overdue" | "soon" | null {
  if (!due || done) {
    return null
  }
  const today = currentTime().toISOString().slice(0, 10)
  if (due < today) {
    return "overdue"
  }
  const soon = new Date(`${today}T00:00:00Z`)
  soon.setUTCDate(soon.getUTCDate() + 2)
  return due <= soon.toISOString().slice(0, 10) ? "soon" : null
}

export function DueDate({
  task,
  className,
}: {
  task: Task
  className?: string
}) {
  if (!task.due) {
    return null
  }
  const state = dueState(task.due, task.status === "done")
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 font-mono text-xs whitespace-nowrap tabular-nums",
        state === "overdue"
          ? "text-destructive"
          : state === "soon"
            ? "text-warning-foreground dark:text-warning"
            : "text-muted-foreground",
        className
      )}
    >
      <CalendarIcon className="size-3" />
      {formatDate(`${task.due}T12:00:00Z`, "day")}
    </span>
  )
}

export function PriorityIcon({
  task,
  className,
}: {
  task: Task
  className?: string
}) {
  const priority = PRIORITY_BY_VALUE.get(task.priority)!
  const Icon = priority.icon
  return (
    <Icon
      className={cn("size-3.5 shrink-0", priority.tone, className)}
      aria-label={`${priority.label} priority`}
    />
  )
}

/** One task on the board: key and priority, title, then label, due date and assignee. */
export function TaskCard({
  task,
  raised = false,
  className,
}: {
  task: Task
  raised?: boolean
  className?: string
}) {
  const label = LABEL_BY_VALUE.get(task.label)!
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-xl bg-card p-3 text-start shadow-(--surface-shadow) ring-1 ring-foreground/5 transition-shadow duration-150",
        raised &&
          "rotate-[1.5deg] shadow-(--surface-shadow-raised) ring-primary/30",
        
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {task.key}
        </span>
        <PriorityIcon task={task} />
      </div>
      <p
        className={cn(
          "line-clamp-2 text-sm leading-snug font-medium",
          task.status === "done" &&
            "text-muted-foreground line-through decoration-muted-foreground/50"
        )}
      >
        {task.title}
      </p>
      <div className="flex items-center gap-2">
        <StatusBadge tone={label.tone} className="h-5 px-1.5 text-[11px]">
          {label.label}
        </StatusBadge>
        <DueDate task={task} />
        <TeamAvatar
          member={task.assigneeId ? TEAM_BY_ID.get(task.assigneeId) : null}
          className="ms-auto"
          tooltip={!raised}
        />
      </div>
    </div>
  )
}
