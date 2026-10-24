"use client"

import {
  columnVisibilityFeature,
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type Updater,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ItemGroup } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import type { SortRule } from "../data/list"

/**
 * The table every list screen uses. Rows arrive already searched, filtered,
 * sorted and paged by the data layer (see kit/data/list and url-state), so
 * TanStack Table here owns only what lives in the browser: which rows are
 * selected and which columns are shown.
 */

export const dataTableFeatures = tableFeatures({ rowSelectionFeature, columnVisibilityFeature })
type Features = typeof dataTableFeatures

export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => React.ReactNode
  /** The sort id the data layer understands. Omit for columns that cannot sort. */
  sortId?: string
  /** First click sorts descending (dates, money) instead of ascending (names). */
  sortDescFirst?: boolean
  /** Whether the column menu can hide it. Defaults to true. */
  hideable?: boolean
  /** Applied to the header and every cell, e.g. `text-end w-28`. */
  className?: string
}

const EMPTY_SELECTION: string[] = []

function resolve<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(current) : updater
}

function SortHeader({ column, sort, onSortChange }: { column: DataColumn<never>; sort: SortRule[]; onSortChange: (sort: SortRule[]) => void }) {
  const active = sort.find((rule) => rule.id === column.sortId)
  const Icon = !active ? ArrowUpDownIcon : active.desc ? ArrowDownIcon : ArrowUpIcon
  const next = () => {
    if (!active) {
      onSortChange([{ id: column.sortId!, desc: column.sortDescFirst ?? false }])
    } else if (active.desc === (column.sortDescFirst ?? false)) {
      onSortChange([{ id: column.sortId!, desc: !active.desc }])
    } else {
      onSortChange([])
    }
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ms-2 h-7 px-2 font-medium", !active && "[&_svg]:text-muted-foreground")}
      onClick={next}
      aria-label={`Sort by ${column.header}`}
    >
      {column.header}
      <Icon data-icon="inline-end" />
    </Button>
  )
}

export function DataTable<T extends RowData>({
  columns,
  rows,
  getRowId,
  loading,
  sort,
  onSortChange,
  selection = EMPTY_SELECTION,
  onSelectionChange,
  hiddenColumns,
  onHiddenColumnsChange,
  onRowClick,
  renderMobileRow,
  empty,
  skeletonRows = 10,
  label,
}: {
  columns: DataColumn<T>[]
  rows: T[] | undefined
  getRowId: (row: T) => string
  loading: boolean
  sort: SortRule[]
  onSortChange: (sort: SortRule[]) => void
  /** Selected row ids. Omit `onSelectionChange` for a table without checkboxes. */
  selection?: string[]
  onSelectionChange?: (ids: string[]) => void
  hiddenColumns?: string[]
  onHiddenColumnsChange?: (ids: string[]) => void
  /** Makes the whole row open the record. Keep a real link in one cell for keyboard users. */
  onRowClick?: (row: T) => void
  /** Phones get this list instead of the table. */
  renderMobileRow?: (row: T, selection: { selected: boolean; toggle: (selected: boolean) => void }) => React.ReactNode
  empty: React.ReactNode
  skeletonRows?: number
  /** Accessible name for the table, e.g. "Orders". */
  label: string
}) {
  const selectable = onSelectionChange !== undefined
  const data = useMemo(() => rows ?? [], [rows])

  const tableColumns = useMemo<ColumnDef<Features, T>[]>(
    () => columns.map((column) => ({ id: column.id, enableHiding: column.hideable ?? true })),
    [columns]
  )

  const rowSelection = useMemo<RowSelectionState>(() => Object.fromEntries(selection.map((id) => [id, true])), [selection])
  const columnVisibility = useMemo<ColumnVisibilityState>(
    () => Object.fromEntries((hiddenColumns ?? []).map((id) => [id, false])),
    [hiddenColumns]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data,
    getRowId: (row) => getRowId(row),
    enableRowSelection: selectable,
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: (updater) => {
      const next = resolve(updater, rowSelection)
      onSelectionChange?.(Object.keys(next).filter((id) => next[id]))
    },
    onColumnVisibilityChange: (updater) => {
      const next = resolve(updater, columnVisibility)
      onHiddenColumnsChange?.(Object.keys(next).filter((id) => next[id] === false))
    },
  })

  const byId = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns])
  const visible = table.getVisibleLeafColumns().map((column) => byId.get(column.id)!)
  const allSelected = data.length > 0 && table.getIsAllPageRowsSelected()
  const someSelected = table.getIsSomePageRowsSelected()

  if (!loading && data.length === 0) {
    return <>{empty}</>
  }

  return (
    <>
      {renderMobileRow && (
        <ItemGroup className="md:hidden">
          {loading
            ? Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16" />)
            : table.getRowModel().rows.map((row) => (
                <div key={row.id}>{renderMobileRow(row.original, { selected: row.getIsSelected(), toggle: (value) => row.toggleSelected(value) })}</div>
              ))}
        </ItemGroup>
      )}
      <div className={cn("overflow-hidden rounded-xl border bg-card", renderMobileRow && "hidden md:block")}>
        <Table aria-label={label} aria-busy={loading || undefined}>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-10 ps-4">
                  <Checkbox
                    aria-label="Select all on this page"
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                  />
                </TableHead>
              )}
              {visible.map((column, index) => (
                <TableHead key={column.id} className={cn(index === 0 && !selectable && "ps-4", column.className)}>
                  {column.sortId ? <SortHeader column={column as DataColumn<never>} sort={sort} onSortChange={onSortChange} /> : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    {selectable && (
                      <TableCell className="ps-4">
                        <Skeleton className="size-4" />
                      </TableCell>
                    )}
                    {visible.map((column) => (
                      <TableCell key={column.id} className={column.className}>
                        <Skeleton className="h-5 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={(event) => {
                      // Clicks on links, buttons and checkboxes inside the row do their own thing.
                      if (!onRowClick || (event.target as HTMLElement).closest("a, button, [role=checkbox], [role=menuitem]")) {
                        return
                      }
                      onRowClick(row.original)
                    }}
                  >
                    {selectable && (
                      <TableCell className="ps-4">
                        <Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked)} />
                      </TableCell>
                    )}
                    {visible.map((column, index) => (
                      <TableCell key={column.id} className={cn(index === 0 && !selectable && "ps-4", column.className)}>
                        {column.cell(row.original)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
