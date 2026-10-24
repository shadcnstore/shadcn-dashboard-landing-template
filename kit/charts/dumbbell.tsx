"use client"

import { useId } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface DumbbellDatum {
  label: string
  /** Tooltip heading; defaults to label. */
  title?: string
  value: number
  /** The same slot in the period before. Left out, the column is a plain pill from zero. */
  previous?: number
}

type Row = DumbbellDatum & { range: [number, number] }

/** A full-height hairline per column with a tick at either end: the rail each dumbbell rides on. */
function Rail(props: Record<string, unknown>) {
  const { x, y, width, height } = props as { x: number; y: number; width: number; height: number }
  const cx = x + width / 2
  return (
    <g className="text-border">
      <line x1={cx} x2={cx} y1={y + 10} y2={y + height - 10} stroke="currentColor" strokeWidth={1} />
      <line x1={cx} x2={cx} y1={y - 2} y2={y + 3} stroke="var(--muted-foreground)" strokeOpacity={0.6} strokeWidth={1} />
      <line x1={cx} x2={cx} y1={y + height - 3} y2={y + height + 2} stroke="var(--muted-foreground)" strokeOpacity={0.6} strokeWidth={1} />
    </g>
  )
}

/**
 * The segment between the period before and this one. The end for this period
 * is the solid, glowing cap; the period before is a ring, so the direction of
 * change reads from the shape alone, not from colour.
 */
function Bell(props: Record<string, unknown> & { stroke: number; color: string; glowId: string }) {
  const { x, y, width, height, payload, stroke, color, glowId } = props as unknown as {
    x: number
    y: number
    width: number
    height: number
    payload: Row
    stroke: number
    color: string
    glowId: string
  }
  if (!payload || Number.isNaN(y)) {
    return null
  }
  const cx = x + width / 2
  const top = y
  const bottom = y + Math.max(0, height)
  const hasPrevious = payload.previous !== undefined
  const grew = !hasPrevious || payload.value >= (payload.previous ?? 0)
  // With a comparison, the ring sits at the far end from this period's value.
  const ringY = grew ? bottom : top
  const ring = stroke / 2 + 1
  return (
    <g>
      {/* A rect, not a line: a filter on a zero-width box is not drawn at all. */}
      <rect
        x={cx - stroke / 2}
        y={top - stroke / 2}
        width={stroke}
        height={bottom - top + stroke}
        rx={stroke / 2}
        fill={color}
        filter={`url(#${glowId})`}
      />
      {/* Level with the period before, the ring is filled: both ends in one place. */}
      {hasPrevious && <circle cx={cx} cy={ringY} r={ring} fill={payload.value === payload.previous ? color : "var(--card)"} stroke={payload.value === payload.previous ? "var(--card)" : color} strokeWidth={1.5} />}
    </g>
  )
}

/**
 * One column per slot on a thin rail: a thick rounded segment running from the
 * period before (a ring) to this period (the glowing end). Rising from the
 * ring is growth, falling from it a drop, and its length is the size of the
 * change. Without a period before, each column is a glowing pill from zero.
 */
export function Dumbbell({
  data,
  color = "var(--chart-lead)",
  format = (value) => String(value),
  previousLabel = "Period before",
  stroke = 6,
  className,
}: {
  data: DumbbellDatum[]
  color?: string
  format?: (value: number) => string
  previousLabel?: string
  /** Segment thickness in pixels. */
  stroke?: number
  className?: string
}) {
  const id = useId().replace(/:/g, "")
  const rows: Row[] = data.map((datum) => {
    const from = datum.previous ?? 0
    return { ...datum, range: [Math.min(from, datum.value), Math.max(from, datum.value)] }
  })
  const max = Math.max(1, ...rows.map((row) => row.range[1]))
  // A dumbbell is read by where its ends sit, not by length from zero, so with
  // a comparison the scale starts just under the lowest end and the changes get
  // the room. Pills from zero keep a zero baseline.
  const compared = rows.some((row) => row.previous !== undefined)
  const min = Math.min(...rows.map((row) => row.range[0]))
  const floor = compared ? Math.max(0, Math.floor(min - (max - min) * 0.25)) : 0
  const ceiling = Math.ceil(max + (max - floor) * 0.08)

  return (
    <ChartContainer config={{ range: { label: "This period", color } }} className={cn("aspect-auto w-full [&_.recharts-surface]:overflow-visible", className)}>
      <BarChart data={rows} margin={{ top: 14, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <filter id={`glow-${id}`} filterUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" style={{ floodColor: color, floodOpacity: 0.4 }} />
          </filter>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} className="font-mono" interval="preserveStartEnd" />
        {/* Headroom so a top ring or cap never touches the end tick. */}
        <YAxis hide domain={[floor, ceiling]} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(_, payload) => {
                const datum = payload[0]?.payload as Row | undefined
                return datum?.title ?? datum?.label ?? ""
              }}
              formatter={(_, __, item) => {
                const datum = item.payload as Row
                return (
                  <span className="flex w-full flex-col gap-1">
                    <span className="flex justify-between gap-4">
                      <span className="text-muted-foreground">This period</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">{format(datum.value)}</span>
                    </span>
                    {datum.previous !== undefined && (
                      <span className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{previousLabel}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">{format(datum.previous)}</span>
                      </span>
                    )}
                  </span>
                )
              }}
            />
          }
        />
        <Bar
          dataKey="range"
          isAnimationActive={false}
          background={(props: unknown) => <Rail {...(props as Record<string, unknown>)} />}
          shape={(props: unknown) => <Bell {...(props as Record<string, unknown>)} stroke={stroke} color={color} glowId={`glow-${id}`} />}
        />
      </BarChart>
    </ChartContainer>
  )
}
