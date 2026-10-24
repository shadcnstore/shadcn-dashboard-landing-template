"use client"

import { useId } from "react"
import { Bar, Cell, ComposedChart, Line, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface HourDatum {
  /** Tooltip heading, e.g. "3 PM". */
  label: string
  current: number
  /** The same hour one period earlier. */
  previous: number
}

/**
 * A day's rhythm: slim rounded bars per hour in a gradient of the lead
 * colour, the latest hour solid and glowing, and the period before as a soft
 * dashed curve over them. Quiet nights, the lunch bump and the evening peak
 * read at a glance, and so does where this period runs above or below.
 */
export function HourBars({
  data,
  color = "var(--chart-lead)",
  format = (value) => String(value),
  currentLabel = "Now",
  previousLabel = "Before",
  className,
}: {
  data: HourDatum[]
  color?: string
  format?: (value: number) => string
  currentLabel?: string
  previousLabel?: string
  className?: string
}) {
  const id = useId().replace(/:/g, "")
  const last = data.length - 1
  return (
    <ChartContainer config={{ current: { label: currentLabel, color }, previous: { label: previousLabel, color: "var(--chart-line)" } }} className={cn("aspect-auto w-full", className)}>
      <ComposedChart data={data} margin={{ top: 6, left: 0, right: 0, bottom: 0 }} barCategoryGap="22%">
        <defs>
          <linearGradient id={`hour-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.12} />
          </linearGradient>
          <filter id={`hour-glow-${id}`} x="-150%" y="-30%" width="400%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" style={{ floodColor: color, floodOpacity: 0.45 }} />
          </filter>
        </defs>
        {/* One scale for both series, from zero, so the curve and the bars compare directly. */}
        <YAxis hide domain={[0, "dataMax"]} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(_, payload) => (payload[0]?.payload as HourDatum | undefined)?.label ?? ""}
              formatter={(value, name) => (
                <span className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{name === "current" ? currentLabel : previousLabel}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">{format(Number(value))}</span>
                </span>
              )}
            />
          }
        />
        <Bar dataKey="current" radius={[999, 999, 2, 2]} maxBarSize={8} minPointSize={2}>
          {data.map((datum, index) => (
            <Cell key={`${datum.label}-${index}`} fill={index === last ? color : `url(#hour-${id})`} filter={index === last ? `url(#hour-glow-${id})` : undefined} />
          ))}
        </Bar>
        <Line dataKey="previous" type="monotone" stroke="var(--chart-line)" strokeOpacity={0.7} strokeWidth={1.5} strokeDasharray="3 3" dot={false} activeDot={false} isAnimationActive={false} />
      </ComposedChart>
    </ChartContainer>
  )
}
