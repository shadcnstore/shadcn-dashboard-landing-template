/**
 * The demo's "now": Tuesday 20 October 2026, noon UTC. Every number, chart
 * and "3 days ago" in the sample data is built back from this moment, so the
 * dashboard reads the same on every visit, at any date, time or time zone.
 *
 * The clock runs on from page load, so records you create in a session land
 * after the sample data. Generated data never reads it: it uses DATA_NOW.
 *
 * With your own backend, set DEMO_NOW to null and the clock is the real one.
 */
export const DEMO_NOW: Date | null = new Date("2026-10-20T12:00:00Z")

/** The moment the sample data is built from. Never moves. */
export const DATA_NOW: Date = DEMO_NOW ?? new Date()

const loadedAt = Date.now()

export function currentTime(): Date {
  return DEMO_NOW ? new Date(DEMO_NOW.getTime() + (Date.now() - loadedAt)) : new Date()
}
