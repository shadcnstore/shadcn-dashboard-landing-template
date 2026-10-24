import { DATA_NOW } from "@/lib/clock"

/**
 * Mail and chat times, in UTC so the sample data reads the same in every
 * time zone: "11:36" today, "Mon" this week, "Oct 3" before that.
 */
const time = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" })
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" })
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
const full = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" })
const longDay = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })

const DAY = 24 * 3600 * 1000

function dayNumber(date: Date): number {
  return Math.floor(date.getTime() / DAY)
}

/** Whole days between `iso` and the demo's today (0 = today, 1 = yesterday). */
export function daysAgo(iso: string): number {
  return dayNumber(DATA_NOW) - dayNumber(new Date(iso))
}

export function formatShortTime(iso: string): string {
  const days = daysAgo(iso)
  if (days <= 0) {
    return time.format(new Date(iso))
  }
  if (days < 7) {
    return weekday.format(new Date(iso))
  }
  return day.format(new Date(iso))
}

export function formatClock(iso: string): string {
  return time.format(new Date(iso))
}

export function formatFull(iso: string): string {
  return `${full.format(new Date(iso))} UTC`
}

/** "Today", "Yesterday" or "Saturday, October 17". */
export function formatDayHeading(iso: string): string {
  const days = daysAgo(iso)
  if (days <= 0) {
    return "Today"
  }
  if (days === 1) {
    return "Yesterday"
  }
  return longDay.format(new Date(iso))
}
