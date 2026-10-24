"use client"

import { useId } from "react"
import { Bar, BarChart, Cell, ComposedChart, Line, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface MiniDatum {
  label: string
  value: number
  /** Second series for BarLine. */
  line?: number
}

function Tooltip({ format, lineLabel }: { format: (value: number) => string; lineLabel?: string }) {
  return (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent
          hideIndicator
          labelFormatter={(_, payload) => (payload[0]?.payload as MiniDatum | undefined)?.label ?? ""}
          formatter={(value, name) => (
            <span className="flex w-full justify-between gap-4">
              {lineLabel && <span className="text-muted-foreground">{name === "line" ? lineLabel : "Value"}</span>}
              <span className="font-mono font-medium tabular-nums text-foreground">{format(Number(value))}</span>
            </span>
          )}
        />
      }
    />
  )
}

/**
 * Glowing pill columns with a smooth line and ringed dots riding through them,
 * on one shared scale. The line has no card-coloured halo: where it crossed a
 * column, a halo clipped the column's round top and it looked square.
 */
export function BarLine({
  data,
  barColor = "var(--chart-lead)",
  lineColor = "var(--chart-line)",
  format = (value) => String(value),
  lineLabel = "Trend",
  showLabels = false,
  baseline = 0,
  className,
}: {
  data: MiniDatum[]
  barColor?: string
  lineColor?: string
  format?: (value: number) => string
  lineLabel?: string
  showLabels?: boolean
  /** Where the columns start. Above zero for figures that only drift, like an average. */
  baseline?: number
  className?: string
}) {
  // Dots help a short series and clutter a long one.
  const dots = data.length <= 16
  return (
    <ChartContainer
      config={{ value: { label: "Value", color: barColor }, line: { label: lineLabel, color: lineColor } }}
      style={{ "--bar-glow": `color-mix(in oklab, ${barColor} 45%, transparent)` } as React.CSSProperties}
      className={cn("aspect-auto w-full [&_.recharts-surface]:overflow-visible [&_.recharts-bar-rectangle]:drop-shadow-[0_6px_10px_var(--bar-glow)]", className)}
    >
      <ComposedChart data={data} margin={{ top: 10, left: 8, right: 8, bottom: 0 }}>
        {showLabels && <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} interval="preserveStartEnd" className="font-mono" />}
        <YAxis hide domain={[baseline, "dataMax"]} />
        <Tooltip format={format} lineLabel={lineLabel} />
        <Bar dataKey="value" fill={barColor} radius={[999, 999, 4, 4]} barSize={14} isAnimationActive={false} />
        <Line
          dataKey="line"
          type="monotone"
          stroke={lineColor}
          strokeWidth={2}
          dot={dots ? { r: 3.5, fill: "var(--card)", stroke: lineColor, strokeWidth: 2 } : false}
          activeDot={{ r: 4.5, fill: "var(--card)", stroke: lineColor, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

/**
 * Many thin bars. The most recent bars are in full colour and older ones fade,
 * which reads as "detailed bar chart" in the references.
 */
export function ThinBars({
  data,
  color = "var(--chart-lead)",
  emphasise = 0.35,
  format = (value) => String(value),
  className,
}: {
  data: MiniDatum[]
  color?: string
  /** Share of the most recent bars shown at full strength. */
  emphasise?: number
  format?: (value: number) => string
  className?: string
}) {
  const cut = Math.floor(data.length * (1 - emphasise))
  return (
    <ChartContainer config={{ value: { label: "Value", color } }} className={cn("aspect-auto w-full", className)}>
      <BarChart data={data} margin={{ top: 4, left: 0, right: 0, bottom: 0 }} barCategoryGap={1}>
        <Tooltip format={format} />
        <Bar dataKey="value" radius={2} maxBarSize={4}>
          {data.map((datum, index) => (
            <Cell key={`${datum.label}-${index}`} fill={index >= cut ? color : "var(--muted-foreground)"} fillOpacity={index >= cut ? 1 : 0.25} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/** Rounded bars filled with a vertical gradient from the lead chart colour down the chart ramp. */
export function GradientBars({
  data,
  from = "var(--chart-lead)",
  via = "var(--chart-2)",
  to = "var(--chart-3)",
  format = (value) => String(value),
  showLabels = false,
  className,
}: {
  data: MiniDatum[]
  from?: string
  via?: string
  to?: string
  format?: (value: number) => string
  showLabels?: boolean
  className?: string
}) {
  const id = useId().replace(/:/g, "")
  return (
    <ChartContainer config={{ value: { label: "Value", color: via } }} className={cn("aspect-auto w-full", className)}>
      <BarChart data={data} margin={{ top: 4, left: 0, right: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="50%" stopColor={via} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        {showLabels && <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} className="font-mono" />}
        <Tooltip format={format} />
        <Bar dataKey="value" fill={`url(#grad-${id})`} radius={[6, 6, 6, 6]} maxBarSize={18} />
      </BarChart>
    </ChartContainer>
  )
}
