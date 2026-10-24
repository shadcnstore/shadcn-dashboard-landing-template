import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleIcon,
  EyeIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"

import { TEAM } from "@/data/names"
import type { TaskLabel, TaskPriority, TaskStatus } from "@/data/schema"
import type { Tone } from "@/kit/ui-patterns/status-badge"

/** Every status, priority and label a task can have, in board and menu order. */

export const STATUSES: {
  value: TaskStatus
  label: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    value: "backlog",
    label: "Backlog",
    icon: CircleDashedIcon,
    tone: "text-muted-foreground",
  },
  {
    value: "todo",
    label: "To do",
    icon: CircleIcon,
    tone: "text-foreground/70",
  },
  {
    value: "in_progress",
    label: "In progress",
    icon: CircleDotIcon,
    tone: "text-chart-lead",
  },
  { value: "review", label: "Review", icon: EyeIcon, tone: "text-chart-2" },
  { value: "done", label: "Done", icon: CircleCheckIcon, tone: "text-success" },
]

export const PRIORITIES: {
  value: TaskPriority
  label: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    value: "urgent",
    label: "Urgent",
    icon: TriangleAlertIcon,
    tone: "text-destructive",
  },
  {
    value: "high",
    label: "High",
    icon: SignalHighIcon,
    tone: "text-foreground",
  },
  {
    value: "medium",
    label: "Medium",
    icon: SignalMediumIcon,
    tone: "text-foreground/70",
  },
  {
    value: "low",
    label: "Low",
    icon: SignalLowIcon,
    tone: "text-muted-foreground",
  },
]

export const LABELS: { value: TaskLabel; label: string; tone: Tone }[] = [
  { value: "bug", label: "Bug", tone: "danger" },
  { value: "feature", label: "Feature", tone: "info" },
  { value: "improvement", label: "Improvement", tone: "success" },
  { value: "docs", label: "Docs", tone: "warning" },
  { value: "chore", label: "Chore", tone: "muted" },
]

export const STATUS_BY_VALUE = new Map(
  STATUSES.map((status) => [status.value, status])
)
export const PRIORITY_BY_VALUE = new Map(
  PRIORITIES.map((priority) => [priority.value, priority])
)
export const LABEL_BY_VALUE = new Map(
  LABELS.map((label) => [label.value, label])
)

export const ASSIGNEE_OPTIONS = [
  ...TEAM.map((member) => ({ value: member.id, label: member.name })),
  { value: "none", label: "Unassigned" },
]

export const TASK_FILTERS = ["status", "priority", "label", "assignee"] as const
export type TaskFilter = (typeof TASK_FILTERS)[number]
