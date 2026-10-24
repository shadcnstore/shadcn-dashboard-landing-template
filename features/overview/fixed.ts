/**
 * Hand-shaped series for two Overview charts. They are written out, not
 * generated, so their shape is the same on every visit at any hour: a demo
 * that shows "today by hour" from the real clock would look empty at 2 AM.
 */

/** Sign-ups per hour over the last 24 hours (oldest first) and the 24 hours before. */
export const SIGNUPS_LAST_24H = [3, 2, 1, 1, 2, 3, 6, 11, 17, 22, 24, 21, 19, 23, 26, 24, 20, 16, 12, 10, 8, 7, 5, 4]
export const SIGNUPS_PREVIOUS_24H = [2, 2, 1, 1, 1, 3, 5, 9, 14, 19, 22, 20, 17, 20, 22, 21, 18, 14, 11, 9, 7, 6, 5, 3]

/** Product sessions by weekday (rows, Monday first) and two-hour block (columns, from midnight), week of 12 Oct, in hundreds. */
export const USAGE_HOURS = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"]
export const USAGE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const USAGE: number[][] = [
  [2, 1, 1, 6, 31, 44, 37, 41, 34, 17, 9, 4],
  [2, 1, 1, 7, 34, 48, 39, 43, 36, 18, 10, 4],
  [2, 1, 1, 7, 33, 46, 38, 42, 35, 18, 9, 4],
  [2, 1, 1, 6, 30, 43, 36, 40, 33, 16, 9, 4],
  [2, 1, 1, 5, 26, 36, 31, 29, 22, 11, 6, 3],
  [1, 1, 0, 1, 4, 8, 9, 8, 6, 5, 4, 2],
  [1, 0, 0, 1, 3, 6, 7, 7, 6, 6, 5, 2],
]
