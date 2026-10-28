import type { PunchCell } from "@/kit/charts/punch-card"

/**
 * Reports opened in Chronicle, by weekday and UTC hour, averaged over a typical
 * week. Hand-shaped and fixed, so the punch card looks the same on every
 * visit: quiet nights, a morning ramp as Europe signs in, a second lift when
 * North America does, and a light weekend.
 */
export const USAGE_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const

export const USAGE_HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0")
)

// Rows are Monday to Sunday; columns are 00:00 to 23:00 UTC.
export const REPORTS_OPENED: readonly (readonly number[])[] = [
  [
    4, 3, 2, 2, 3, 6, 12, 24, 41, 58, 66, 63, 55, 61, 74, 82, 78, 64, 46, 31,
    20, 13, 8, 5,
  ],
  [
    5, 3, 2, 2, 3, 7, 14, 27, 46, 64, 72, 68, 59, 66, 80, 88, 84, 69, 49, 33,
    22, 14, 9, 6,
  ],
  [
    5, 3, 2, 2, 4, 7, 14, 28, 47, 66, 75, 70, 61, 68, 83, 92, 87, 71, 51, 34,
    22, 14, 9, 6,
  ],
  [
    5, 3, 2, 2, 3, 7, 13, 26, 44, 62, 70, 66, 58, 64, 78, 86, 81, 66, 47, 31,
    21, 13, 8, 5,
  ],
  [
    4, 3, 2, 2, 3, 6, 11, 22, 37, 52, 58, 54, 45, 48, 57, 61, 55, 42, 29, 19,
    13, 9, 6, 4,
  ],
  [
    3, 2, 1, 1, 1, 2, 3, 5, 8, 12, 15, 17, 16, 15, 16, 17, 15, 12, 9, 7, 6, 5,
    4, 3,
  ],
  [
    2, 2, 1, 1, 1, 1, 2, 4, 6, 9, 11, 12, 12, 11, 13, 15, 16, 15, 14, 12, 10, 7,
    4, 3,
  ],
]

export const USAGE_CELLS: PunchCell[] = REPORTS_OPENED.flatMap((row, y) =>
  row.map((value, x) => ({ x, y, value }))
)

/** The busiest slot, for the caption. */
export function busiestSlot(): { day: string; hour: string; value: number } {
  const best = USAGE_CELLS.reduce(
    (top, cell) => (cell.value > top.value ? cell : top),
    USAGE_CELLS[0]
  )
  return {
    day: USAGE_DAYS[best.y],
    hour: USAGE_HOURS[best.x],
    value: best.value,
  }
}

/** Reports opened in a typical week. */
export const WEEKLY_REPORTS = USAGE_CELLS.reduce(
  (total, cell) => total + cell.value,
  0
)

/** Share of the week's reports opened on weekdays. */
export const WEEKDAY_SHARE =
  REPORTS_OPENED.slice(0, 5)
    .flat()
    .reduce((total, value) => total + value, 0) / WEEKLY_REPORTS
