"use client"

import {
  KanbanSquareIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
  XIcon,
} from "lucide-react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { Task, TaskStatus } from "@/data/schema"
import { useAdapter, useKitMutation, useList } from "@/kit/data/hooks"
import type { ListQuery } from "@/kit/data/list"
import { useListState } from "@/kit/data/url-state"
import { FacetedFilter } from "@/kit/data-table/faceted-filter"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { ErrorState } from "@/kit/ui-patterns/query-state"
import { Segmented } from "@/kit/ui-patterns/segmented"
import type { Resources } from "@/lib/data"

import { CreateTaskDialog } from "./create-task-dialog"
import { TaskBoard } from "./task-board"
import { dueState } from "./task-card"
import {
  ASSIGNEE_OPTIONS,
  LABELS,
  PRIORITIES,
  STATUS_BY_VALUE,
  STATUSES,
  TASK_FILTERS,
} from "./task-meta"
import { TaskTable, type TaskPatch } from "./task-table"

const VIEWS = ["board", "table"] as const
/** The board shows every task; a real backend would page each column instead. */
const ALL: ListQuery = { pageSize: 1000 }

export function TasksPage() {
  const adapter = useAdapter<Resources>()
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(VIEWS).withDefault("board")
  )
  const list = useListState({ filters: TASK_FILTERS, defaultSort: "rank" })
  const [creating, setCreating] = useState<TaskStatus | null>(null)

  // The board ignores the status filter (columns are the statuses) and paging.
  const boardQuery = useMemo<ListQuery>(
    () => ({
      ...ALL,
      search: list.query.search,
      filters: {
        priority: list.filters.priority,
        label: list.filters.label,
        assignee: list.filters.assignee,
      },
    }),
    [
      list.query.search,
      list.filters.priority,
      list.filters.label,
      list.filters.assignee,
    ]
  )
  const all = useList<Resources, "tasks">("tasks", ALL)
  const board = useList<Resources, "tasks">("tasks", boardQuery)
  const table = useList<Resources, "tasks">("tasks", list.query)

  const patch = useKitMutation(
    ({ id, patch }: TaskPatch) => adapter.update("tasks", id, patch),
    {
      invalidate: ["tasks"],
      success: (task, input) => ({
        title: input.patch.status
          ? `${task.key} moved to ${STATUS_BY_VALUE.get(task.status)!.label}`
          : `${task.key} priority changed`,
        description: task.title,
      }),
      error: "Could not update the task",
    }
  )

  const tasks = all.data?.rows ?? []
  const nextKey = `TW-${Math.max(139, ...tasks.map((task: Task) => Number(task.key.split("-")[1]) || 0)) + 1}`
  const open = tasks.filter((task) => task.status !== "done").length
  const overdue = tasks.filter(
    (task) => dueState(task.due, task.status === "done") === "overdue"
  ).length
  const filtered =
    view === "board"
      ? list.activeFilterCount - (list.filters.status.length > 0 ? 1 : 0) > 0
      : list.activeFilterCount > 0
  const error = view === "board" ? board.error : table.error

  return (
    <>
      <PageHeader
        title="Tasks"
        description={
          all.data
            ? `${open} open · ${overdue} overdue · Tidewell's product backlog`
            : "Tidewell's product backlog"
        }
        actions={
          <>
            <Segmented
              aria-label="View"
              className="w-auto"
              value={view}
              onChange={(next) => setView(next === "board" ? null : next)}
              options={[
                { value: "board", label: "Board", icon: KanbanSquareIcon },
                { value: "table", label: "Table", icon: TableIcon },
              ]}
            />
            <Button onClick={() => setCreating("todo")}>
              <PlusIcon data-icon="inline-start" />
              New task
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search tasks"
            placeholder="Search by title or key"
            value={list.searchInput}
            onChange={(event) => list.setSearch(event.target.value)}
          />
        </InputGroup>
        {view === "table" && (
          <FacetedFilter
            title="Status"
            options={STATUSES}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        )}
        <FacetedFilter
          title="Priority"
          options={PRIORITIES}
          value={list.filters.priority}
          onChange={(value) => list.setFilter("priority", value)}
        />
        <FacetedFilter
          title="Label"
          options={LABELS}
          value={list.filters.label}
          onChange={(value) => list.setFilter("label", value)}
        />
        <FacetedFilter
          title="Assignee"
          options={ASSIGNEE_OPTIONS}
          value={list.filters.assignee}
          onChange={(value) => list.setFilter("assignee", value)}
        />
        {filtered && (
          <Button variant="ghost" size="sm" onClick={list.clearFilters}>
            <XIcon data-icon="inline-start" />
            Reset
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState
          error={error}
          onRetry={() => (view === "board" ? board.refetch() : table.refetch())}
        />
      ) : view === "board" ? (
        <TaskBoard
          tasks={board.data?.rows}
          allTasks={all.data?.rows}
          loading={board.isPending}
          onAdd={setCreating}
        />
      ) : (
        <TaskTable
          result={table.data}
          loading={table.isPending}
          sort={list.sort}
          onSortChange={list.setSort}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
          onPatch={(input) => patch.mutate(input)}
          onClear={list.clearFilters}
          filtered={filtered}
        />
      )}

      <CreateTaskDialog
        open={creating !== null}
        onOpenChange={(next) => !next && setCreating(null)}
        initialStatus={creating ?? "todo"}
        nextKey={nextKey}
      />
    </>
  )
}
