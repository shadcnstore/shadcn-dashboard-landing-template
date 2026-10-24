import type { Metadata } from "next"

import { CalendarApp } from "@/features/calendar/calendar-app"

export const metadata: Metadata = { title: "Calendar" }

export default function Page() {
  return <CalendarApp />
}
