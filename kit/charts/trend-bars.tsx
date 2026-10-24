"use client"

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface TrendDatum {
  label: string
  /** Tooltip heading; defaults to label. */
  title?: string
  value: number
  /** The matching point of the period before, drawn as a dashed line. */
  previous?: number
}

/**
 * This period as rounded bars in the lead chart colour, the period before as
 * a quiet dashed line over them. For "how is it going compared with last
 * time" charts; Home's stepped lines are for comparing channels.
 */
export function TrendBars({
  data,
  label,
  previousLabel = "Previous period",
  showPrevious = true,
  format = (value) => String(value),
  className,
}: {
  data: TrendDatum[]
  label: string
  previousLabel?: string
  showPrevious?: boolean
  format?: (value: number) => string
  className?: string
}) {
  const config = {
    value: { label, color: "var(--chart-lead)" },
    previous: { label: previousLabel, color: "var(--chart-line)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)}>
      <ComposedChart data={data} margin={{ top: 8, left: 0, right: 8, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={32} className="font-mono" />
        <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value: number) => format(value)} className="font-mono" />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const datum = payload[0]?.payload as TrendDatum | undefined
                return datum?.title ?? datum?.label ?? ""
              }}
              formatter={(value, name, item) => (
                <>
                  <span className="size-2.5 shrink-0 rounded-full bg-(--color-bg)" style={{ "--color-bg": item.color } as React.CSSProperties} />
                  <span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? name}</span>
                  <span className="ms-auto ps-4 font-mono font-medium tabular-nums text-foreground">{format(Number(value))}</span>
                </>
              )}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 1, 1]} maxBarSize={22} />
        {showPrevious && (
          <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 3 }} />
        )}
      </ComposedChart>
    </ChartContainer>
  )
}
