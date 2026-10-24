"use client"

import dynamic from "next/dynamic"
import type { ComponentProps, ComponentType } from "react"

import type { HourBars as HourBarsChart } from "@/kit/charts/hour-bars"
import type { PillBars as PillBarsChart } from "@/kit/charts/pill-bars"
import type { StepLines as StepLinesChart } from "@/kit/charts/step-lines"
import type { MrrMovementChart as MovementChart } from "@/features/analytics/mrr-movement-chart"
import { cn } from "@/lib/utils"

/**
 * The Kit's Recharts charts, loaded after the page has painted. Recharts
 * measures its container in the browser, so it draws nothing on the server
 * anyway; loading it late keeps about 100 KB of script off the first paint.
 * The wrapper keeps the chart's size, so nothing moves when it arrives.
 */
function lazy<P extends { className?: string }>(load: () => Promise<ComponentType<P>>) {
  const Chart = dynamic(load, { ssr: false })
  function LazyChart({ className, ...props }: P) {
    return (
      <div className={cn("min-w-0", className)}>
        <Chart {...(props as unknown as P)} className="size-full" />
      </div>
    )
  }
  return LazyChart
}

export const PillBars = lazy<ComponentProps<typeof PillBarsChart>>(() => import("@/kit/charts/pill-bars").then((module) => module.PillBars))
export const HourBars = lazy<ComponentProps<typeof HourBarsChart>>(() => import("@/kit/charts/hour-bars").then((module) => module.HourBars))
export const StepLines = lazy<ComponentProps<typeof StepLinesChart>>(() => import("@/kit/charts/step-lines").then((module) => module.StepLines))
export const MrrMovementChart = lazy<ComponentProps<typeof MovementChart>>(() => import("@/features/analytics/mrr-movement-chart").then((module) => module.MrrMovementChart))
