"use client"

import { useId } from "react"
import { Bar, BarChart, Cell, XAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface PillDatum {
  label: string
  value: number
  /** Tooltip heading; defaults to label. */
  title?: string
  /**
   * For a bar still filling up (today, say): what a typical one reaches. It is
   * drawn as a dashed outline behind the bar, so a period in progress reads as
   * "so far" rather than as a gap.
   */
  expected?: number
}

/**
 * The dashed outline of a bar still filling up. It is drawn by the stacked
 * "rest" segment but spans the whole column, down over the filled part, so it
 * reads as one pill: solid so far, dashed for what a typical one reaches.
 */
function ExpectedOutline(props: Record<string, unknown>) {
  const { x, y, width, height, payload, color, clipId } = props as { x: number; y: number; width: number; height: number; payload: PillDatum & { rest: number }; color: string; clipId: string }
  if (!payload || payload.rest <= 0 || height <= 0) {
    return null
  }
  const filled = (height / payload.rest) * payload.value
  const total = height + filled
  const radius = Math.min(width, total) / 2
  const inset = 0.75
  // The fill is clipped to the pill, so a small "so far" sits in its rounded bottom like liquid instead of floating as its own capsule.
  return (
    <g>
      <clipPath id={clipId}>
        <rect x={x} y={y} width={width} height={total} rx={radius} />
      </clipPath>
      <rect x={x} y={y + height} width={width} height={filled} fill={color} clipPath={`url(#${clipId})`} />
      <rect
        x={x + inset}
        y={y + inset}
        width={Math.max(0, width - inset * 2)}
        height={Math.max(0, total - inset * 2)}
        rx={Math.max(0, radius - inset)}
        fill="none"
        stroke="var(--chart-line)"
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
    </g>
  )
}

/**
 * Fully rounded bars. One bar is highlighted in the theme's lead chart colour and
 * glows; the rest sit back in a tint of the same colour. Used for "basic bar"
 * small widgets and as a hero chart.
 */
export function PillBars({
  data,
  color = "var(--chart-lead)",
  highlight = "max",
  format = (value) => String(value),
  showLabels = true,
  spotlight = false,
  className,
  barSize = 28,
}: {
  data: PillDatum[]
  color?: string
  /** Which bar to emphasise: the largest, the last, or an index. */
  highlight?: "max" | "last" | number
  format?: (value: number) => string
  showLabels?: boolean
  /**
   * Three tiers instead of two: the highlight in full colour, its neighbours in
   * a tint of it, the rest in neutral grey, so the eye lands on one stretch.
   * Empty bars still show as a dot, so a quiet slot reads as low, not missing.
   */
  spotlight?: boolean
  className?: string
  barSize?: number
}) {
  const id = useId().replace(/:/g, "")
  const target =
    typeof highlight === "number"
      ? highlight
      : highlight === "last"
        ? data.length - 1
        : data.reduce((best, datum, index) => (datum.value > data[best].value ? index : best), 0)
  const pending = data.some((datum) => datum.expected !== undefined)
  // The still-to-come part is stacked on the bar, so the outline and the fill share one column and line up exactly.
  const rows = pending ? data.map((datum) => ({ ...datum, rest: datum.expected === undefined ? 0 : Math.max(0, datum.expected - datum.value) })) : data

  return (
    <ChartContainer config={{ value: { label: "Value", color } }} className={cn("aspect-auto w-full [&_.recharts-surface]:overflow-visible", className)}>
      <BarChart data={rows} margin={{ top: 8, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <filter id={`glow-${id}`} filterUnits="userSpaceOnUse" x="-10%" y="-20%" width="120%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" style={{ floodColor: color, floodOpacity: 0.45 }} />
          </filter>
        </defs>
        {showLabels && <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} className="font-mono" interval="preserveStartEnd" />}
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(_, payload) => {
                const datum = payload[0]?.payload as PillDatum | undefined
                return datum?.title ?? datum?.label ?? ""
              }}
              formatter={(value, name, item) => {
                const datum = item.payload as PillDatum
                if (name === "rest") {
                  return datum.expected === undefined ? null : (
                    <span className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">Typical</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">{format(datum.expected)}</span>
                    </span>
                  )
                }
                return (
                  <span className="flex w-full justify-between gap-4">
                    {datum.expected !== undefined && <span className="text-muted-foreground">So far</span>}
                    <span className="font-mono font-medium tabular-nums text-foreground">{format(Number(value))}</span>
                  </span>
                )
              }}
            />
          }
        />
        <Bar dataKey="value" stackId="day" radius={999} maxBarSize={barSize} minPointSize={spotlight ? barSize : 0}>
          {data.map((datum, index) => {
            const neighbour = spotlight && Math.abs(index - target) === 1
            const quiet = spotlight && index !== target && !neighbour
            return (
              <Cell
                key={`${datum.label}-${index}`}
                fill={quiet ? "var(--muted-foreground)" : color}
                // A bar still under its typical level is drawn by ExpectedOutline, clipped to the pill.
                fillOpacity={
                  datum.expected !== undefined && datum.value < datum.expected
                    ? 0
                    : index === target || datum.expected !== undefined
                      ? 1
                      : neighbour
                        ? 0.45
                        : quiet
                          ? 0.22
                          : 0.28
                }
                filter={index === target ? `url(#glow-${id})` : undefined}
              />
            )
          })}
        </Bar>
        {pending && <Bar dataKey="rest" stackId="day" maxBarSize={barSize} isAnimationActive={false} shape={(shape: unknown) => <ExpectedOutline {...(shape as Record<string, unknown>)} color={color} clipId={`pending-${id}`} />} />}
      </BarChart>
    </ChartContainer>
  )
}
