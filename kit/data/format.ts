import { currentTime } from "@/lib/clock"

/**
 * Formatting for every number and date on screen. Money is stored in integer
 * cents everywhere; these helpers are the only place it becomes text.
 */

export interface FormatOptions {
  locale?: string
  currency?: string
}

const DEFAULT_LOCALE = "en-US"
const DEFAULT_CURRENCY = "USD"

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat | Intl.RelativeTimeFormat>()

function numberFormat(key: string, create: () => Intl.NumberFormat): Intl.NumberFormat {
  if (!cache.has(key)) {
    cache.set(key, create())
  }
  return cache.get(key) as Intl.NumberFormat
}

export function formatMoney(cents: number, options: FormatOptions & { compact?: boolean } = {}): string {
  const locale = options.locale ?? DEFAULT_LOCALE
  const currency = options.currency ?? DEFAULT_CURRENCY
  // Compact amounts under 1,000 show whole units ("$620", not "$620.2").
  const whole = options.compact && Math.abs(cents) < 100000
  const key = `money|${locale}|${currency}|${options.compact ? "c" : "f"}|${whole ? "w" : ""}`
  const format = numberFormat(key, () =>
    options.compact
      ? new Intl.NumberFormat(locale, { style: "currency", currency, notation: "compact", maximumFractionDigits: whole ? 0 : 1 })
      : new Intl.NumberFormat(locale, { style: "currency", currency })
  )
  return format.format(cents / 100)
}

export function formatNumber(value: number, options: FormatOptions & { compact?: boolean; decimals?: number } = {}): string {
  const locale = options.locale ?? DEFAULT_LOCALE
  const key = `number|${locale}|${options.compact ? "c" : "f"}|${options.decimals ?? "auto"}`
  const format = numberFormat(key, () =>
    new Intl.NumberFormat(locale, {
      notation: options.compact ? "compact" : "standard",
      maximumFractionDigits: options.decimals ?? (options.compact ? 1 : 0),
      minimumFractionDigits: options.decimals ?? 0,
    })
  )
  return format.format(value)
}

/** `0.1234` → `12.3%`. */
export function formatPercent(ratio: number, options: FormatOptions & { decimals?: number; signed?: boolean } = {}): string {
  const locale = options.locale ?? DEFAULT_LOCALE
  const decimals = options.decimals ?? 1
  const key = `percent|${locale}|${decimals}|${options.signed ? "s" : "u"}`
  const format = numberFormat(key, () =>
    new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
      signDisplay: options.signed ? "exceptZero" : "auto",
    })
  )
  return format.format(ratio)
}

type DateStyle = "date" | "datetime" | "time" | "month" | "day"

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  date: { year: "numeric", month: "short", day: "numeric" },
  datetime: { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
  time: { hour: "numeric", minute: "2-digit" },
  month: { month: "short", year: "numeric" },
  day: { month: "short", day: "numeric" },
}

export function formatDate(value: string | Date, style: DateStyle = "date", options: FormatOptions = {}): string {
  const locale = options.locale ?? DEFAULT_LOCALE
  const key = `date|${locale}|${style}`
  if (!cache.has(key)) {
    cache.set(key, new Intl.DateTimeFormat(locale, DATE_OPTIONS[style]))
  }
  return (cache.get(key) as Intl.DateTimeFormat).format(typeof value === "string" ? new Date(value) : value)
}

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
]

/** "3 hours ago", "yesterday", "in 2 days". */
export function formatRelative(value: string | Date, now: Date = currentTime(), options: FormatOptions = {}): string {
  const locale = options.locale ?? DEFAULT_LOCALE
  const key = `relative|${locale}`
  if (!cache.has(key)) {
    cache.set(key, new Intl.RelativeTimeFormat(locale, { numeric: "auto" }))
  }
  const format = cache.get(key) as Intl.RelativeTimeFormat
  const seconds = ((typeof value === "string" ? new Date(value) : value).getTime() - now.getTime()) / 1000
  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(seconds) >= size) {
      return format.format(Math.round(seconds / size), unit)
    }
  }
  return format.format(0, "minute")
}

/** Change between two values as a ratio, or null when there is nothing to compare with. */
export function change(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }
  return (current - previous) / Math.abs(previous)
}
