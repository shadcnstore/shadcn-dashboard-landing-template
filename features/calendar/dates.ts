import { DATA_NOW } from "@/lib/clock"

/**
 * Calendar dates are plain "YYYY-MM-DD" keys computed in UTC, so the month
 * grid and every event land on the same day in every time zone.
 */

const DAY = 24 * 3600 * 1000

export function toKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function fromKey(key: string): Date {
  return new Date(`${key}T00:00:00Z`)
}

export function addDays(key: string, days: number): string {
  return toKey(new Date(fromKey(key).getTime() + days * DAY))
}

/** The demo's today: Tuesday 20 October 2026. */
export const TODAY = toKey(DATA_NOW)

export interface MonthCursor {
  year: number
  /** 0 to 11. */
  month: number
}

export function monthOf(key: string): MonthCursor {
  const date = fromKey(key)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
}

export function shiftMonth(cursor: MonthCursor, by: number): MonthCursor {
  const index = cursor.year * 12 + cursor.month + by
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 }
}

export function inMonth(key: string, cursor: MonthCursor): boolean {
  const { year, month } = monthOf(key)
  return year === cursor.year && month === cursor.month
}

/** Six weeks of keys, Monday first, covering the month. */
export function monthGrid(cursor: MonthCursor): string[] {
  const first = new Date(Date.UTC(cursor.year, cursor.month, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const start = addDays(toKey(first), -offset)
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
const dayTitle = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })
const dayShort = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })

export function formatMonth(cursor: MonthCursor): string {
  return monthTitle.format(new Date(Date.UTC(cursor.year, cursor.month, 1)))
}

export function formatDay(key: string): string {
  return dayTitle.format(fromKey(key))
}

export function formatDayShort(key: string): string {
  return dayShort.format(fromKey(key))
}

export function dayOfMonth(key: string): number {
  return fromKey(key).getUTCDate()
}

/** "HH:MM" to minutes since midnight. */
export function minutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number)
  return hours * 60 + mins
}

export function duration(start: string, end: string): string {
  return formatMinutes(minutes(end) - minutes(start))
}

/** 90 to "1h 30m". */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return hours && mins ? `${hours}h ${mins}m` : hours ? `${hours}h` : `${mins}m`
}
