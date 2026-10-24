"use client"

import { useId, useState } from "react"
import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"

import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface GlowDatum {
  label: string
  /** Heading over the marker; defaults to label. */
  title?: string
  value: number
}

/**
 * Where a uniform B-spline (d3's curveBasis, recharts' "basis") passes at each
 * point. The curve smooths through its points rather than touching them, so
 * the marker sits here, on the drawn line; its label still shows the value.
 */
function basisHeights(values: number[]): number[] {
  return values.map((value, index) =>
    index === 0 || index === values.length - 1 ? value : (values[index - 1] + 4 * value + values[index + 1]) / 6
  )
}

/**
 * One series as a glowing curve over a dotted fill that fades toward the
 * baseline. A ringed marker with a drop line names one point: the highlight
 * (the peak unless given) at rest, whichever point is under the pointer on
 * hover, so the marker doubles as the tooltip. A last point still being
 * counted, such as today, carries on the same curve but dotted and unfilled,
 * so a part day does not read as a collapse.
 */
export function GlowArea({
  data,
  format = (value) => String(value),
  highlight,
  highlightLabel = "Peak",
  lastIsPartial = false,
  partialLabel = "So far",
  className,
}: {
  data: GlowDatum[]
  format?: (value: number) => string
  /** Index marked at rest. Defaults to the highest point. */
  highlight?: number
  /** Caption over the resting marker. */
  highlightLabel?: string
  lastIsPartial?: boolean
  partialLabel?: string
  className?: string
}) {
  const id = useId().replace(/:/g, "")
  const [hovered, setHovered] = useState<number | null>(null)

  const complete = lastIsPartial && data.length > 2 ? data.length - 1 : data.length
  const peak = data.slice(0, complete).reduce((best, datum, index, all) => (datum.value > all[best].value ? index : best), 0)
  const active = Math.min(hovered ?? highlight ?? peak, data.length - 1)
  const point = data[active]
  const heights = basisHeights(data.map((datum) => datum.value))

  const caption = hovered === null ? `${highlightLabel} · ${point.title ?? point.label}` : active >= complete ? `${partialLabel} · ${point.title ?? point.label}` : (point.title ?? point.label)
  // Keep the marker's label inside the plot at either end.
  const anchor = active < data.length * 0.15 ? "start" : active > data.length * 0.85 ? "end" : "middle"

  // The curve spans the first point to the last, so the hand-over from solid to
  // dotted sits at this share of its width.
  const split = data.length > 1 ? (complete - 1) / (data.length - 1) : 1
  const solid = `glow-solid-${id}`
  const tail = `glow-tail-${id}`

  const config = { value: { label: "Value", color: "var(--chart-lead)" } } satisfies ChartConfig

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full [&_.recharts-surface]:overflow-visible", className)}>
      <ComposedChart
        data={data}
        margin={{ top: 44, left: 0, right: 12, bottom: 0 }}
        onMouseMove={(state) => {
          const index = state?.activeTooltipIndex
          setHovered(index === undefined || index === null ? null : Number(index))
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={`tint-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-lead)" stopOpacity={0.16} />
            <stop offset="100%" stopColor="var(--chart-lead)" stopOpacity={0} />
          </linearGradient>
          <pattern id={`dots-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.8" fill="var(--chart-lead)" fillOpacity={0.45} />
          </pattern>
          {/* Laid over the dots in the card colour, so they fade out toward the baseline. */}
          <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--card)" stopOpacity={0} />
            <stop offset="85%" stopColor="var(--card)" stopOpacity={1} />
          </linearGradient>
          {/* Fractions of each shape's own box; generous top and bottom keep the glow. */}
          <clipPath id={`clip-${solid}`} clipPathUnits="objectBoundingBox">
            <rect x={-0.05} y={-1} width={split + 0.05} height={3} />
          </clipPath>
          <clipPath id={`clip-${tail}`} clipPathUnits="objectBoundingBox">
            <rect x={split} y={-1} width={1.05 - split} height={3} />
          </clipPath>
          <style>{`
            .${solid} path { clip-path: url(#clip-${solid}); }
            .${tail} path { clip-path: url(#clip-${tail}); }
            .glow-${id} path { filter: drop-shadow(0 6px 12px color-mix(in oklab, var(--chart-lead) 45%, transparent)); }
          `}</style>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="2 4" strokeOpacity={0.5} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={32} className="font-mono" />
        <YAxis tickLine={false} axisLine={false} width={44} tickCount={4} tickFormatter={(value: number) => format(value)} className="font-mono" />
        <Tooltip content={() => null} cursor={false} />

        <Area className={solid} dataKey="value" type="basis" stroke="none" fill={`url(#tint-${id})`} isAnimationActive={false} activeDot={false} />
        <Area className={solid} dataKey="value" type="basis" stroke="none" fill={`url(#dots-${id})`} isAnimationActive={false} activeDot={false} />
        <Area className={solid} dataKey="value" type="basis" stroke="none" fill={`url(#fade-${id})`} isAnimationActive={false} activeDot={false} />

        <ReferenceLine
          segment={[{ x: point.label, y: 0 }, { x: point.label, y: heights[active] }]}
          stroke="var(--chart-lead)"
          strokeOpacity={0.5}
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        <Line
          className={cn(solid, `glow-${id}`)}
          dataKey="value"
          type="basis"
          stroke="var(--chart-lead)"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
        {complete < data.length && (
          <Line
            className={tail}
            dataKey="value"
            type="basis"
            stroke="var(--chart-lead)"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeDasharray="0.5 5"
            strokeOpacity={0.55}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        )}
        <ReferenceDot
          x={point.label}
          y={heights[active]}
          r={5.5}
          fill="var(--card)"
          stroke="var(--chart-lead)"
          strokeWidth={2.5}
          label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => {
            const x = (viewBox?.x ?? 0) + 5.5
            const y = (viewBox?.y ?? 0) - 6
            const dx = anchor === "start" ? -6 : anchor === "end" ? 6 : 0
            return (
              <g pointerEvents="none">
                <text x={x + dx} y={y - 22} textAnchor={anchor} className="fill-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  {caption}
                </text>
                <text x={x + dx} y={y - 4} textAnchor={anchor} className="fill-foreground font-mono text-sm font-semibold tabular-nums">
                  {format(point.value)}
                </text>
              </g>
            )
          }}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
