"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { MrrMonth } from "@/data/schema"
import { formatMoney } from "@/kit/data/format"
import { cn } from "@/lib/utils"

import { monthLabel } from "./metrics"

import { MOVEMENT_CONFIG } from "./movement-config"

export { MOVEMENT_CONFIG }

const money = (cents: number) => formatMoney(cents, { compact: true })

/**
 * MRR movement per month as diverging stacked bars: new and expansion grow
 * up from zero, contraction and churn hang below it, and the net change rides
 * over them as a line with ringed dots.
 */
export function MrrMovementChart({
  months,
  partialMonth,
  className,
}: {
  months: MrrMonth[]
  partialMonth?: string
  className?: string
}) {
  const data = months.map((month) => ({
    label: monthLabel(month.month),
    title: `${monthLabel(month.month, true)}${month.month === partialMonth ? " (so far)" : ""}`,
    newCents: month.newCents,
    expansionCents: month.expansionCents,
    contractionCents: -month.contractionCents,
    churnCents: -month.churnCents,
    netCents:
      month.newCents +
      month.expansionCents -
      month.contractionCents -
      month.churnCents,
  }))
  const dots = data.length <= 12

  return (
    <ChartContainer
      config={MOVEMENT_CONFIG}
      className={cn("aspect-auto w-full", className)}
    >
      <ComposedChart
        data={data}
        stackOffset="sign"
        margin={{ top: 8, left: 0, right: 8, bottom: 0 }}
        barCategoryGap={data.length <= 3 ? "38%" : "24%"}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          className="font-mono"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => money(value)}
          className="font-mono"
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                (payload[0]?.payload as { title?: string } | undefined)
                  ?.title ?? ""
              }
              formatter={(value, name, item) => (
                <>
                  <span
                    className="size-2.5 shrink-0 rounded-full bg-(--color-bg)"
                    style={{ "--color-bg": item.color } as React.CSSProperties}
                  />
                  <span className="text-muted-foreground">
                    {MOVEMENT_CONFIG[name as keyof typeof MOVEMENT_CONFIG]
                      ?.label ?? name}
                  </span>
                  <span className="ms-auto ps-4 font-mono font-medium tabular-nums text-foreground">
                    {Number(value) > 0 && name !== "netCents" ? "+" : ""}
                    {formatMoney(Number(value))}
                  </span>
                </>
              )}
            />
          }
        />
        <Bar
          dataKey="newCents"
          stackId="movement"
          fill="var(--color-newCents)"
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Bar
          dataKey="expansionCents"
          stackId="movement"
          fill="var(--color-expansionCents)"
          radius={[5, 5, 0, 0]}
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Bar
          dataKey="contractionCents"
          stackId="movement"
          fill="var(--color-contractionCents)"
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Bar
          dataKey="churnCents"
          stackId="movement"
          fill="var(--color-churnCents)"
          fillOpacity={0.85}
          radius={[0, 0, 5, 5]}
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Line
          dataKey="netCents"
          type="monotone"
          stroke="var(--color-netCents)"
          strokeWidth={2}
          dot={
            dots
              ? {
                  r: 3.5,
                  fill: "var(--card)",
                  stroke: "var(--color-netCents)",
                  strokeWidth: 2,
                }
              : false
          }
          activeDot={{
            r: 4.5,
            fill: "var(--card)",
            stroke: "var(--color-netCents)",
            strokeWidth: 2,
          }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
