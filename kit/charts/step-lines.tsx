"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface StepSeries {
  key: string
  label: string
  color: string
}

/**
 * Stepped lines, each with a soft gradient fill that fades downward. Reads
 * well for per-day or per-week totals where the value holds for the period.
 */
export function StepLines({
  data,
  xKey,
  series,
  format = (value) => String(value),
  xFormat = (value) => value,
  className,
}: {
  data: Record<string, string | number>[]
  xKey: string
  series: StepSeries[]
  format?: (value: number) => string
  xFormat?: (value: string) => string
  className?: string
}) {
  const id = useId().replace(/:/g, "")
  const config = Object.fromEntries(series.map((entry) => [entry.key, { label: entry.label, color: entry.color }])) satisfies ChartConfig
  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)}>
      <AreaChart data={data} margin={{ top: 8, left: 0, right: 8, bottom: 0 }}>
        <defs>
          {series.map((entry) => (
            <linearGradient key={entry.key} id={`step-${id}-${entry.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={entry.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={entry.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={xFormat} className="font-mono" />
        <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value: number) => format(value)} className="font-mono" />
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => xFormat(String(value))}
              formatter={(value, name, item) => (
                <>
                  <span className="size-2.5 shrink-0 rounded-full bg-(--color-bg)" style={{ "--color-bg": item.color } as React.CSSProperties} />
                  <span className="text-muted-foreground">{config[name as string]?.label ?? name}</span>
                  <span className="ms-auto ps-4 font-mono font-medium tabular-nums text-foreground">{format(Number(value))}</span>
                </>
              )}
            />
          }
        />
        {series.map((entry) => (
          <Area
            key={entry.key}
            dataKey={entry.key}
            type="stepAfter"
            stroke={entry.color}
            strokeWidth={2}
            fill={`url(#step-${id}-${entry.key})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
