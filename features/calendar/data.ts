import { addDays, TODAY } from "./dates"

/**
 * Maya Okafor's October at Tidewell. Every event is placed a fixed number of
 * days from the demo's today, so the calendar looks the same on every visit.
 * Times are UTC.
 */

export type CalendarId = "team" | "customers" | "billing" | "focus"

export const CALENDARS: { id: CalendarId; title: string; dot: string; chip: string }[] = [
  { id: "team", title: "Team", dot: "bg-primary", chip: "bg-primary/10 text-foreground before:bg-primary" },
  { id: "customers", title: "Customer calls", dot: "bg-chart-2", chip: "bg-chart-2/12 text-foreground before:bg-chart-2" },
  { id: "billing", title: "Billing and finance", dot: "bg-chart-3", chip: "bg-chart-3/15 text-foreground before:bg-chart-3" },
  { id: "focus", title: "Focus time", dot: "bg-success", chip: "bg-success/10 text-foreground before:bg-success" },
]

export interface CalendarEvent {
  id: string
  title: string
  date: string
  /** "HH:MM" in UTC; null for an all-day event. */
  start: string | null
  end: string | null
  calendar: CalendarId
  location?: string
  /** Tidewell team member ids. */
  attendees: string[]
}

type Row = [offset: number, start: string | null, end: string | null, title: string, calendar: CalendarId, location: string | undefined, attendees: string[]]

const ONE_OFFS: Row[] = [
  [-19, "09:00", "09:30", "Monthly invoice run", "billing", undefined, ["tm_tariq"]],
  [-14, "15:00", "15:30", "Northgate Logistics: plan review", "customers", "Video call", ["tm_hana"]],
  [-12, "09:00", "10:30", "Board update prep", "focus", undefined, []],
  [-11, "11:00", "11:30", "1:1 with Hana", "team", "Room 2", ["tm_hana"]],
  [-7, "10:00", "11:00", "Larkspur Design onboarding", "customers", "Video call", ["tm_diego"]],
  [-6, "13:00", "13:30", "Juniper Payments: export API sync", "customers", "Video call", ["tm_soren", "tm_tariq"]],
  [-4, "11:00", "12:00", "Incident review: webhook delays", "team", "Room 1", ["tm_soren", "tm_emeka", "tm_tariq"]],
  [-1, "16:00", "16:30", "Heron Clinics: invoice reissue", "billing", undefined, ["tm_tariq"]],
  [0, "10:00", "10:30", "Kestrel Freight renewal call", "customers", "Video call", ["tm_hana"]],
  [0, "13:00", "14:00", "Q4 renewals plan", "focus", undefined, []],
  [0, "15:30", "16:00", "Payment retries readout", "billing", "Room 2", ["tm_tariq", "tm_freya"]],
  [1, "11:00", "11:45", "Saltmarsh Health security review", "customers", "Video call", ["tm_hana", "tm_soren"]],
  [1, "14:00", "14:30", "Design review: seat limit banner", "team", "Room 1", ["tm_priya", "tm_emeka"]],
  [2, "15:00", "15:30", "Cobble Learning walkthrough", "customers", "Video call", ["tm_diego"]],
  [2, "16:00", "16:30", "Kestrel Freight: pricing follow-up", "customers", "Video call", ["tm_hana", "tm_tariq"]],
  [3, "12:00", "13:00", "Team lunch", "team", "Harbour Kitchen", ["tm_soren", "tm_priya", "tm_diego", "tm_hana", "tm_tariq", "tm_freya", "tm_emeka"]],
  [7, "10:30", "11:00", "Larkspur Design renewal check-in", "customers", "Video call", ["tm_diego"]],
  [8, "14:00", "15:00", "Month-end close prep", "billing", "Room 2", ["tm_tariq", "tm_freya"]],
  [10, "09:00", "09:30", "Monthly invoice run", "billing", undefined, ["tm_tariq"]],
  [10, "13:00", "17:00", "Q4 planning offsite", "team", "Lighthouse Studio", ["tm_soren", "tm_priya", "tm_diego", "tm_hana", "tm_emeka"]],
  [11, null, null, "Saltmarsh Health trial ends", "customers", undefined, ["tm_hana"]],
  [12, null, null, "Kestrel Freight renewal date", "billing", undefined, ["tm_hana", "tm_tariq"]],
  [16, "10:00", "10:30", "Basalt Energy renewal call", "customers", "Video call", ["tm_hana"]],
  [20, null, null, "Northgate Logistics moves to Growth", "billing", undefined, ["tm_tariq"]],
  [22, "09:00", "11:00", "Pricing page rewrite", "focus", undefined, []],
]

/** Weekly meetings: Monday ops review, Tuesday 1:1, Friday metrics review. */
const RECURRING: Row[] = Array.from({ length: 11 }, (_, index) => {
  const week = (index - 4) * 7
  return [
    [week - 1, "09:00", "09:30", "Weekly ops review", "team", "Room 1", ["tm_soren", "tm_diego", "tm_hana", "tm_tariq"]] as Row,
    [week, "16:30", "17:00", "1:1 with Diego", "team", "Room 2", ["tm_diego"]] as Row,
    [week + 3, "15:00", "15:45", "Metrics review", "team", "Video call", ["tm_freya", "tm_soren"]] as Row,
  ]
}).flat()

export const EVENTS: CalendarEvent[] = [...ONE_OFFS, ...RECURRING].map(([offset, start, end, title, calendar, location, attendees], index) => ({
  id: `evt_${String(index + 1).padStart(3, "0")}`,
  title,
  date: addDays(TODAY, offset),
  start,
  end,
  calendar,
  location,
  attendees,
}))
