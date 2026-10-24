"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

import { CALENDARS, type CalendarId } from "./data"
import { formatDayShort, minutes } from "./dates"
import { useCalendar } from "./store"

/** Half-hour slots from 07:00 to 20:00. */
const TIMES = Array.from({ length: 27 }, (_, index) => {
  const total = 7 * 60 + index * 30
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
})
const TIME_ITEMS = TIMES.map((time) => ({ value: time, label: time }))
const CALENDAR_ITEMS = CALENDARS.map((calendar) => ({ value: calendar.id, label: calendar.title }))

function Form({ date: initialDate, onDone }: { date: string; onDone: () => void }) {
  const add = useCalendar((state) => state.add)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(initialDate)
  const [allDay, setAllDay] = useState(false)
  const [start, setStart] = useState("10:00")
  const [end, setEnd] = useState("10:30")
  const [calendar, setCalendar] = useState<CalendarId>("team")
  const [location, setLocation] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const titleInvalid = submitted && !title.trim()
  const dateInvalid = submitted && !/^\d{4}-\d{2}-\d{2}$/.test(date)
  const timeInvalid = submitted && !allDay && minutes(end) <= minutes(start)

  return (
    <form
      id="event-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
        if (!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (!allDay && minutes(end) <= minutes(start))) {
          return
        }
        add({ title: title.trim(), date, start: allDay ? null : start, end: allDay ? null : end, calendar, location: location.trim() || undefined, attendees: [] })
        toast.add({ type: "success", title: "Event created", description: `${title.trim()}, ${formatDayShort(date)}${allDay ? "" : ` at ${start}`}` })
        onDone()
      }}
    >
      <FieldGroup className="gap-4">
        <Field data-invalid={titleInvalid || undefined}>
          <FieldLabel htmlFor="event-title">Title</FieldLabel>
          <Input id="event-title" placeholder="Renewal call with Kestrel Freight" value={title} onChange={(event) => setTitle(event.target.value)} aria-invalid={titleInvalid || undefined} autoFocus />
          {titleInvalid && <FieldError>Give the event a title.</FieldError>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field data-invalid={dateInvalid || undefined}>
            <FieldLabel htmlFor="event-date">Date</FieldLabel>
            <Input id="event-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-invalid={dateInvalid || undefined} className="num" />
            {dateInvalid && <FieldError>Pick a date.</FieldError>}
          </Field>
          <Field orientation="horizontal" className="h-8 w-fit">
            <Switch id="event-all-day" checked={allDay} onCheckedChange={setAllDay} />
            <FieldLabel htmlFor="event-all-day">All day</FieldLabel>
          </Field>
        </div>
        <div className={cn("grid grid-cols-2 gap-4", allDay && "hidden")}>
          <Field data-invalid={timeInvalid || undefined}>
            <FieldLabel htmlFor="event-start">Starts</FieldLabel>
            <Select
              items={TIME_ITEMS}
              value={start}
              onValueChange={(value) => {
                if (!value) {
                  return
                }
                setStart(value)
                if (minutes(end) <= minutes(value)) {
                  setEnd(TIMES[Math.min(TIMES.indexOf(value) + 1, TIMES.length - 1)])
                }
              }}
            >
              <SelectTrigger id="event-start" className="num w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIMES.slice(0, -1).map((time) => (
                    <SelectItem key={time} value={time} className="num">
                      {time}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field data-invalid={timeInvalid || undefined}>
            <FieldLabel htmlFor="event-end">Ends</FieldLabel>
            <Select items={TIME_ITEMS} value={end} onValueChange={(value) => value && setEnd(value)}>
              <SelectTrigger id="event-end" className="num w-full" aria-invalid={timeInvalid || undefined}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIMES.slice(1).map((time) => (
                    <SelectItem key={time} value={time} className="num">
                      {time}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {timeInvalid && <FieldError>End after it starts.</FieldError>}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="event-calendar">Calendar</FieldLabel>
            <Select items={CALENDAR_ITEMS} value={calendar} onValueChange={(value) => value && setCalendar(value as CalendarId)}>
              <SelectTrigger id="event-calendar" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CALENDARS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <span className={cn("size-2 rounded-full", item.dot)} aria-hidden />
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="event-location">Location</FieldLabel>
            <Input id="event-location" placeholder="Video call" value={location} onChange={(event) => setLocation(event.target.value)} />
          </Field>
        </div>
      </FieldGroup>
    </form>
  )
}

/** New event. Times are UTC, like the rest of the sample calendar. */
export function EventDialog({ open, date, session, onOpenChange }: { open: boolean; date: string; /** Changes on every open, so the form starts empty. */ session: number; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>Times are in UTC.</DialogDescription>
        </DialogHeader>
        <Form key={session} date={date} onDone={() => onOpenChange(false)} />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="event-form">
            Create event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
