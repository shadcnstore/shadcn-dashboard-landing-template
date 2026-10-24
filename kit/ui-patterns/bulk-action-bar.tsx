"use client"

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { formatNumber } from "../data/format"

/**
 * Floats at the bottom of the screen while table rows are selected. Every
 * table uses this one bar, so bulk actions are always in the same place.
 */
export function BulkActionBar({ count, onClear, children }: { count: number; onClear: () => void; children: React.ReactNode }) {
  if (count === 0) {
    return null
  }
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="sticky bottom-4 z-10 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border bg-popover p-1.5 ps-3 text-popover-foreground shadow-lg"
    >
      <span className="text-sm font-medium tabular-nums">{formatNumber(count)} selected</span>
      <Separator orientation="vertical" className="h-5" />
      {children}
      <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={onClear}>
        <XIcon />
      </Button>
    </div>
  )
}
