"use client"

import { create } from "zustand"

import { CALENDARS, EVENTS, type CalendarEvent, type CalendarId } from "./data"
import { inMonth, monthOf, shiftMonth, TODAY, type MonthCursor } from "./dates"

interface CalendarState {
  events: CalendarEvent[]
  hidden: CalendarId[]
  selected: string
  cursor: MonthCursor
  /** Selects a day and shows its month. */
  selectDay: (key: string) => void
  goToMonth: (by: number) => void
  goToToday: () => void
  toggleCalendar: (id: CalendarId) => void
  add: (event: Omit<CalendarEvent, "id">) => void
  remove: (id: string) => void
  restore: (event: CalendarEvent) => void
}

let created = 0

export const useCalendar = create<CalendarState>((set) => ({
  events: EVENTS,
  hidden: [],
  selected: TODAY,
  cursor: monthOf(TODAY),
  selectDay: (key) => set((state) => ({ selected: key, cursor: inMonth(key, state.cursor) ? state.cursor : monthOf(key) })),
  goToMonth: (by) => set((state) => ({ cursor: shiftMonth(state.cursor, by) })),
  goToToday: () => set({ selected: TODAY, cursor: monthOf(TODAY) }),
  toggleCalendar: (id) => set((state) => ({ hidden: state.hidden.includes(id) ? state.hidden.filter((value) => value !== id) : [...state.hidden, id] })),
  add: (event) => {
    created += 1
    set((state) => ({ events: [...state.events, { ...event, id: `evt_new_${created}` }], selected: event.date, cursor: monthOf(event.date), hidden: state.hidden.filter((id) => id !== event.calendar) }))
  },
  remove: (id) => set((state) => ({ events: state.events.filter((event) => event.id !== id) })),
  restore: (event) => set((state) => ({ events: [...state.events, event] })),
}))

/** All-day events first, then by start time. */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => (a.start ?? "").localeCompare(b.start ?? "") || a.title.localeCompare(b.title))
}

export const CALENDAR_BY_ID = Object.fromEntries(CALENDARS.map((calendar) => [calendar.id, calendar])) as Record<CalendarId, (typeof CALENDARS)[number]>
