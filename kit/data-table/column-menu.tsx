"use client"

import { Columns3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { DataColumn } from "./data-table"

/** Show or hide table columns. */
export function ColumnMenu<T>({
  columns,
  hidden,
  onHiddenChange,
}: {
  columns: DataColumn<T>[]
  hidden: string[]
  onHiddenChange: (hidden: string[]) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Columns3Icon data-icon="inline-start" />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns
            .filter((column) => column.hideable !== false)
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={!hidden.includes(column.id)}
                onCheckedChange={(checked) => onHiddenChange(checked ? hidden.filter((id) => id !== column.id) : [...hidden, column.id])}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
