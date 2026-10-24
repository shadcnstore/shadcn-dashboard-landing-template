"use client"

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/kit/ui-patterns/page-header"

import { Agenda } from "./agenda"
import { formatMonth, inMonth, TODAY } from "./dates"
import { EventDialog } from "./event-dialog"
import { MonthGrid } from "./month-grid"
import { useCalendar } from "./store"

/**
 * Calendar: the month grid with the selected day's agenda beside it (below
 * it under 1280px). Events, filters and the selection live in ./store.
 */
export function CalendarApp() {
  const allEvents = useCalendar((state) => state.events)
  const hidden = useCalendar((state) => state.hidden)
  const cursor = useCalendar((state) => state.cursor)
  const selected = useCalendar((state) => state.selected)
  const goToMonth = useCalendar((state) => state.goToMonth)
  const goToToday = useCalendar((state) => state.goToToday)
  const [dialog, setDialog] = useState({ open: false, date: TODAY, session: 0 })

  const events = useMemo(() => allEvents.filter((event) => !hidden.includes(event.calendar)), [allEvents, hidden])
  const monthCount = events.filter((event) => inMonth(event.date, cursor)).length
  const create = (date: string) => setDialog((current) => ({ open: true, date, session: current.session + 1 }))

  return (
    <>
      <PageHeader
        title="Calendar"
        description={
          <>
            <span className="num">{monthCount}</span> events in {formatMonth(cursor)}. Times in UTC.
          </>
        }
        actions={
          <Button onClick={() => create(selected)}>
            <PlusIcon data-icon="inline-start" />
            New event
          </Button>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label={formatMonth(cursor)} className="overflow-hidden rounded-2xl bg-card shadow-(--surface-shadow)">
          <div className="flex items-center gap-2 border-b px-3 py-2.5 md:px-4">
            <h2 className="font-heading text-base font-semibold tracking-tight md:text-lg" aria-live="polite">
              {formatMonth(cursor)}
            </h2>
            <div className="ms-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center">
                <Button variant="outline" size="icon-sm" className="rounded-e-none" onClick={() => goToMonth(-1)} aria-label="Previous month">
                  <ChevronLeftIcon className="rtl:rotate-180" />
                </Button>
                <Button variant="outline" size="icon-sm" className="-ms-px rounded-s-none" onClick={() => goToMonth(1)} aria-label="Next month">
                  <ChevronRightIcon className="rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </div>
          <MonthGrid events={events} onCreate={create} />
        </section>
        <Agenda events={events} allEvents={allEvents} onCreate={create} />
      </div>
      <EventDialog open={dialog.open} date={dialog.date} session={dialog.session} onOpenChange={(open) => setDialog((current) => ({ ...current, open }))} />
    </>
  )
}
