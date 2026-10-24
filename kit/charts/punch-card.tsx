"use client"

import { cn } from "@/lib/utils"

export interface PunchCell {
  /** Column index. */
  x: number
  /** Row index. */
  y: number
  value: number
}

/**
 * A punch card: a bubble per cell, sized and shaded by its value. Drawn as a
 * CSS grid of dots rather than a chart, so it stays crisp, keyboard-free and
 * readable by screen readers through the cell titles.
 */
export function PunchCard({
  cells,
  columns,
  rows,
  color = "var(--chart-lead)",
  format = (value) => String(value),
  className,
}: {
  cells: PunchCell[]
  columns: string[]
  rows: string[]
  color?: string
  format?: (value: number) => string
  className?: string
}) {
  const max = Math.max(1, ...cells.map((cell) => cell.value))
  const lookup = new Map(cells.map((cell) => [`${cell.x}|${cell.y}`, cell.value]))

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-[auto_repeat(var(--columns),minmax(0,1fr))] items-center gap-y-1" style={{ "--columns": columns.length } as React.CSSProperties}>
        {rows.map((row, y) => (
          <div key={row} className="contents">
            <span className="pe-3 text-end font-mono text-xs text-muted-foreground">{row}</span>
            {columns.map((column, x) => {
              const value = lookup.get(`${x}|${y}`) ?? 0
              const ratio = value / max
              const size = value === 0 ? 4 : 6 + ratio * 26
              return (
                <div key={column} className="relative flex h-9 items-center justify-center border-s border-dashed" title={`${column} ${row}: ${format(value)}`}>
                  <span
                    className="rounded-full transition-transform hover:scale-110"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: color,
                      opacity: value === 0 ? 0.15 : 0.35 + ratio * 0.65,
                      boxShadow: ratio > 0.7 ? `0 6px 16px -2px ${color}` : undefined,
                    }}
                  />
                </div>
              )
            })}
          </div>
        ))}
        <span />
        {columns.map((column) => (
          <span key={column} className="pt-2 text-center font-mono text-xs text-muted-foreground">
            {column}
          </span>
        ))}
      </div>
    </div>
  )
}
