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

const RADIUS = 5

/**
 * Draws one stacked segment, rounding only the outer end of its stack: the top
 * of the highest segment above zero, the bottom of the lowest one below it.
 * Everything else is square, so a stack reads as one bar from either end.
 */
function stackEnd(key: string) {
  function StackSegment(props: unknown) {
    const { x, y, width, height, fill, fillOpacity, payload } = props as { x: number; y: number; width: number; height: number; fill: string; fillOpacity?: number; payload: { outerUp: string; outerDown: string } }
    const h = Math.abs(height)
    if (!h || !width) {
      return null
    }
    const top = height < 0 ? y + height : y
    const up = payload.outerUp === key && (key === "newCents" || key === "expansionCents")
    const down = payload.outerDown === key && (key === "contractionCents" || key === "churnCents")
    const r = Math.min(RADIUS, width / 2, h)
    const right = x + width
    const bottom = top + h
    const d = up
      ? `M${x},${bottom}L${x},${top + r}Q${x},${top} ${x + r},${top}L${right - r},${top}Q${right},${top} ${right},${top + r}L${right},${bottom}Z`
      : down
        ? `M${x},${top}L${right},${top}L${right},${bottom - r}Q${right},${bottom} ${right - r},${bottom}L${x + r},${bottom}Q${x},${bottom} ${x},${bottom - r}Z`
        : `M${x},${top}L${right},${top}L${right},${bottom}L${x},${bottom}Z`
    return <path d={d} fill={fill} fillOpacity={fillOpacity} />
  }
  return StackSegment
}

/** Made once, so the chart never remounts its bars. */
const SHAPES = { newCents: stackEnd("newCents"), expansionCents: stackEnd("expansionCents"), contractionCents: stackEnd("contractionCents"), churnCents: stackEnd("churnCents") }

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
  const raw = months.map((month) => ({
    newCents: month.newCents,
    expansionCents: month.expansionCents,
    contractionCents: -month.contractionCents,
    churnCents: -month.churnCents,
  }))
  // A segment under 1.2% of the tallest stack would draw as a sliver of a pixel or two:
  // it is left out of the drawing (the tooltip still lists it) so each stack reads as one bar.
  const tallest = Math.max(1, ...raw.map((row) => Math.max(row.newCents + row.expansionCents, -(row.contractionCents + row.churnCents))))
  const visible = (cents: number) => (Math.abs(cents) < tallest * 0.012 ? 0 : cents)
  const data = months.map((month, index) => {
    const plotted = {
      newCents: visible(raw[index].newCents),
      expansionCents: visible(raw[index].expansionCents),
      contractionCents: visible(raw[index].contractionCents),
      churnCents: visible(raw[index].churnCents),
    }
    return {
      label: monthLabel(month.month),
      title: `${monthLabel(month.month, true)}${month.month === partialMonth ? " (so far)" : ""}`,
      ...plotted,
      raw: raw[index],
      // Which segment ends each side of the stack: only that one gets rounded corners.
      outerUp: plotted.expansionCents > 0 ? "expansionCents" : "newCents",
      outerDown: plotted.churnCents < 0 ? "churnCents" : "contractionCents",
      netCents: month.newCents + month.expansionCents - month.contractionCents - month.churnCents,
    }
  })
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
                    {(() => {
                      const shown = name === "netCents" ? Number(value) : ((item.payload as { raw: Record<string, number> }).raw[String(name)] ?? Number(value))
                      return `${shown > 0 && name !== "netCents" ? "+" : ""}${formatMoney(shown)}`
                    })()}
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
          shape={SHAPES.newCents}
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Bar
          dataKey="expansionCents"
          stackId="movement"
          fill="var(--color-expansionCents)"
          shape={SHAPES.expansionCents}
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Bar
          dataKey="contractionCents"
          stackId="movement"
          fill="var(--color-contractionCents)"
          shape={SHAPES.contractionCents}
          maxBarSize={30}
          isAnimationActive={false}
        />
        <Bar
          dataKey="churnCents"
          stackId="movement"
          fill="var(--color-churnCents)"
          fillOpacity={0.85}
          shape={SHAPES.churnCents}
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
