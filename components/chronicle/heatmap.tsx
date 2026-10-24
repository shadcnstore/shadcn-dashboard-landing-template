import { cn } from "@/lib/utils"

/**
 * A weekday-by-hour heatmap: square cells shaded by value in the lead chart
 * colour, no glow, so neighbouring cells never fuse. The cells cap their size
 * and the hour labels thin out with the card's width (container queries), so
 * it reads at 280px and at 900px alike.
 */
export function Heatmap({
  rows,
  columns,
  values,
  format = (value) => String(value),
  label,
  className,
}: {
  rows: readonly string[]
  columns: readonly string[]
  /** values[row][column] */
  values: readonly (readonly number[])[]
  format?: (value: number) => string
  /** What the chart shows, for screen readers, e.g. "Sessions by weekday and hour". */
  label: string
  className?: string
}) {
  const max = Math.max(1, ...values.flat())
  const n = columns.length
  // Three tiers of hour labels: always every `wide`th, then every `mid`th from a medium card, then all of them when there is room.
  const wide = Math.max(1, Math.ceil(n / 4))
  const mid = Math.max(1, Math.ceil(n / 8))
  const all = n <= 12 ? 1 : 2
  const peak = values.flatMap((row, y) => row.map((value, x) => ({ value, x, y }))).reduce((best, cell) => (cell.value > best.value ? cell : best))

  return (
    <figure className={cn("@container w-full", className)}>
      <figcaption className="sr-only">
        {label}. Peak {rows[peak.y]} {columns[peak.x]}, {format(peak.value)}.
      </figcaption>
      <div className="grid items-center gap-[3px]" style={{ gridTemplateColumns: `2.25rem repeat(${n}, minmax(0, 1fr))` }} aria-hidden>
        {values.map((row, y) => (
          <div key={rows[y]} className="contents">
            <span className="pe-2 font-mono text-[11px] text-muted-foreground">{rows[y]}</span>
            {row.map((value, x) => (
              <span key={x} className="flex justify-center" title={`${rows[y]} ${columns[x]}: ${format(value)}`}>
                <span
                  className="aspect-square w-full max-w-8 rounded-[4px]"
                  style={{ backgroundColor: value === 0 ? "var(--muted)" : `color-mix(in oklch, var(--chart-lead) ${Math.round(12 + (value / max) * 88)}%, var(--muted))` }}
                />
              </span>
            ))}
          </div>
        ))}
        <span />
        {columns.map((column, x) => (
          <span
            key={column}
            className={cn(
              "mt-1.5 overflow-visible text-center font-mono text-[10px] whitespace-nowrap text-muted-foreground",
              // invisible, not hidden: a thinned label keeps its column, so the others stay under their own cells.
              x % wide !== 0 && "invisible",
              x % wide !== 0 && x % mid === 0 && "@sm:visible",
              x % wide !== 0 && x % mid !== 0 && x % all === 0 && "@xl:visible"
            )}
          >
            {column}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground" aria-hidden>
        Less
        {[0.15, 0.4, 0.65, 0.9].map((share) => (
          <span key={share} className="size-2.5 rounded-[3px]" style={{ backgroundColor: `color-mix(in oklch, var(--chart-lead) ${Math.round(12 + share * 88)}%, var(--muted))` }} />
        ))}
        More
      </div>
    </figure>
  )
}
