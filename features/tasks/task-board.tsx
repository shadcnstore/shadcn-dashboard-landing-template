"use client"

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PlusIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task, TaskStatus } from "@/data/schema"
import { useAdapter, useKitMutation } from "@/kit/data/hooks"
import type { Resources } from "@/lib/data"
import { cn } from "@/lib/utils"

import { TaskCard } from "./task-card"
import { STATUSES } from "./task-meta"

type Columns = Record<TaskStatus, string[]>

const COLUMN_PREFIX = "column:"

function toColumns(tasks: Task[]): Columns {
  const columns: Columns = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  }
  for (const task of [...tasks].sort((a, b) => a.rank - b.rank)) {
    columns[task.status].push(task.id)
  }
  return columns
}

function columnOf(columns: Columns, id: string): TaskStatus | null {
  if (id.startsWith(COLUMN_PREFIX)) {
    return id.slice(COLUMN_PREFIX.length) as TaskStatus
  }
  return (
    (Object.keys(columns) as TaskStatus[]).find((status) =>
      columns[status].includes(id)
    ) ?? null
  )
}

/**
 * Where the dropped task goes in its whole column, not just the visible part
 * of it: with a filter on, the board shows only some tasks, so the position is
 * taken from the visible task it landed after (or before, at the top).
 */
export function positionInFullColumn(
  visible: string[],
  id: string,
  full: string[]
): number {
  const rest = full.filter((entry) => entry !== id)
  const at = visible.indexOf(id)
  const before = visible[at - 1]
  if (before !== undefined && rest.includes(before)) {
    return rest.indexOf(before) + 1
  }
  const after = visible[at + 1]
  if (after !== undefined && rest.includes(after)) {
    return rest.indexOf(after)
  }
  return before === undefined ? 0 : rest.length
}

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn("list-none", isDragging && "opacity-40")}>
      <div
        className="cursor-grab touch-manipulation rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
        aria-label={`${task.key}: ${task.title}`}
        {...attributes}
        {...listeners}
      >
        <TaskCard task={task} />
      </div>
    </li>
  )
}

function Column({
  status,
  ids,
  byId,
  onAdd,
}: {
  status: (typeof STATUSES)[number]
  ids: string[]
  byId: Map<string, Task>
  onAdd: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${COLUMN_PREFIX}${status.value}`,
  })
  const Icon = status.icon
  return (
    <section
      aria-label={status.label}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col gap-2 rounded-2xl bg-muted/50 p-2 transition-colors duration-150 md:w-auto md:min-w-0 dark:bg-muted/30",
        isOver && "bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <header className="flex items-center gap-2 px-1.5 pt-1">
        <Icon className={cn("size-4", status.tone)} />
        <h2 className="text-sm font-medium">{status.label}</h2>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {ids.length}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="ms-auto text-muted-foreground"
          aria-label={`Add a task to ${status.label}`}
          onClick={onAdd}
        >
          <PlusIcon />
        </Button>
      </header>
      <SortableContext
        id={status.value}
        items={ids}
        strategy={verticalListSortingStrategy}
      >
        <ul ref={setNodeRef} className="flex min-h-40 flex-1 flex-col gap-2">
          {ids.map((id) => {
            const task = byId.get(id)
            return task ? <SortableTask key={id} task={task} /> : null
          })}
          {ids.length === 0 && (
            <li className="flex h-24 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
              Drop a task here
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  )
}

/**
 * The board: a column per status. Drag a card within or between columns with
 * the pointer, or focus it and use Space, the arrow keys and Space again. The
 * drop is saved through the adapter's `tasks.move` action; until the refetch
 * lands, the board keeps showing where you put it.
 */
export function TaskBoard({
  tasks,
  allTasks,
  loading,
  onAdd,
}: {
  tasks: Task[] | undefined
  allTasks: Task[] | undefined
  loading: boolean
  onAdd: (status: TaskStatus) => void
}) {
  const adapter = useAdapter<Resources>()
  const derived = useMemo(() => toColumns(tasks ?? []), [tasks])
  const [override, setOverride] = useState<Columns | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const columns = override ?? derived
  const byId = useMemo(
    () => new Map((allTasks ?? tasks ?? []).map((task) => [task.id, task])),
    [allTasks, tasks]
  )

  const move = useKitMutation(
    (input: { id: string; status: TaskStatus; index: number }) =>
      adapter.action<Task>("tasks", "move", input),
    {
      invalidate: ["tasks"],
      error: "Could not move the task",
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setOverride(derived)
  }

  // Crossing into another column moves the card there at once, so the gap opens where it will land.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      return
    }
    setOverride((current) => {
      const state = current ?? derived
      const from = columnOf(state, String(active.id))
      const to = columnOf(state, String(over.id))
      if (!from || !to || from === to) {
        return state
      }
      const target = state[to]
      const overIndex = target.indexOf(String(over.id))
      const index = overIndex === -1 ? target.length : overIndex
      return {
        ...state,
        [from]: state[from].filter((id) => id !== active.id),
        [to]: [
          ...target.slice(0, index),
          String(active.id),
          ...target.slice(index),
        ],
      }
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const state = override ?? derived
    const id = String(active.id)
    const status = columnOf(state, id)
    if (!over || !status) {
      setOverride(null)
      return
    }
    let column = state[status]
    const overIndex = column.indexOf(String(over.id))
    if (overIndex !== -1 && overIndex !== column.indexOf(id)) {
      column = arrayMove(column, column.indexOf(id), overIndex)
    }
    const next = { ...state, [status]: column }
    const original = byId.get(id)
    const full = (allTasks ?? [])
      .filter((task) => task.status === status)
      .sort((a, b) => a.rank - b.rank)
      .map((task) => task.id)
    const index = positionInFullColumn(column, id, full)
    const unchanged = original?.status === status && full.indexOf(id) === index
    if (unchanged) {
      setOverride(null)
      return
    }
    setOverride(next)
    move
      .mutateAsync({ id, status, index })
      .catch(() => undefined)
      .finally(() => setOverride(null))
  }

  if (loading && !tasks) {
    return (
      <div className="flex gap-3 overflow-hidden md:grid md:grid-cols-5">
        {STATUSES.map((status) => (
          <Skeleton
            key={status.value}
            className="h-96 w-72 shrink-0 rounded-2xl md:w-auto"
          />
        ))}
      </div>
    )
  }

  const active = activeId ? byId.get(activeId) : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null)
        setOverride(null)
      }}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "To pick up a task, press Space or Enter. Use the arrow keys to move it within or between columns, Space or Enter to drop it, Escape to cancel.",
        },
      }}
    >
      <ScrollArea className="-mx-4 md:mx-0">
        <div className="flex snap-x gap-3 px-4 pb-3 md:grid md:grid-cols-5 md:px-0">
          {STATUSES.map((status) => (
            <Column
              key={status.value}
              status={status}
              ids={columns[status.value]}
              byId={byId}
              onAdd={() => onAdd(status.value)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {active ? <TaskCard task={active} raised /> : null}
      </DragOverlay>
    </DndContext>
  )
}
