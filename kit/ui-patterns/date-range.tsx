"use client"

import { CalendarIcon } from "lucide-react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { useMemo } from "react"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { currentTime, DEMO_NOW } from "@/lib/clock"

export const RANGE_PRESETS = ["today", "7d", "30d", "month", "90d", "ytd", "12m"] as const
export type RangePreset = (typeof RANGE_PRESETS)[number]

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  month: "This month",
  "90d": "Last 90 days",
  ytd: "Year to date",
  "12m": "Last 12 months",
}

/**
 * Resolve a preset to an ISO range ending now. Days start at midnight in the
 * browser's time zone, except on the demo clock, where they start at midnight
 * UTC like the sample data's days, so every visitor sees the same figures.
 */
export function resolveRange(preset: RangePreset, now: Date = currentTime(), utc: boolean = DEMO_NOW !== null): { from: string; to: string } {
  const start = new Date(now)
  const day = () => (utc ? start.getUTCDate() : start.getDate())
  const setDay = (value: number) => (utc ? start.setUTCDate(value) : start.setDate(value))
  if (utc) {
    start.setUTCHours(0, 0, 0, 0)
  } else {
    start.setHours(0, 0, 0, 0)
  }
  switch (preset) {
    case "today":
      break
    case "7d":
      setDay(day() - 6)
      break
    case "30d":
      setDay(day() - 29)
      break
    case "month":
      setDay(1)
      break
    case "90d":
      setDay(day() - 89)
      break
    case "ytd":
      if (utc) {
        start.setUTCMonth(0, 1)
      } else {
        start.setMonth(0, 1)
      }
      break
    case "12m":
      if (utc) {
        start.setUTCFullYear(start.getUTCFullYear() - 1)
      } else {
        start.setFullYear(start.getFullYear() - 1)
      }
      setDay(day() + 1)
      break
  }
  return { from: start.toISOString(), to: now.toISOString() }
}

/** The selected range, kept in the address as `?range=30d` so views can be shared. */
export function useDateRange(fallback: RangePreset = "30d") {
  const [preset, setPreset] = useQueryState("range", parseAsStringLiteral(RANGE_PRESETS).withDefault(fallback))
  const range = useMemo(() => resolveRange(preset), [preset])
  return { preset, setPreset, range }
}

export function DateRangeSelect({ value, onChange }: { value: RangePreset; onChange: (value: RangePreset) => void }) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as RangePreset)}>
      <SelectTrigger className="w-44" aria-label="Date range">
        <CalendarIcon />
        <SelectValue>{(selected: RangePreset) => RANGE_LABELS[selected]}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {RANGE_PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {RANGE_LABELS[preset]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
