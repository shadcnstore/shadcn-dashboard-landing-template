"use client"

import { CalendarPlusIcon, CalendarX2Icon, MapPinIcon, MoreHorizontalIcon, Trash2Icon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { MEMBERS } from "@/features/chat/data"
import { DATA_NOW } from "@/lib/clock"
import { cn } from "@/lib/utils"

import { CALENDARS, type CalendarEvent } from "./data"
import { duration, formatDay, formatMinutes, inMonth, minutes, TODAY } from "./dates"
import { CALENDAR_BY_ID, sortEvents, useCalendar } from "./store"

/** The demo clock: noon UTC on DATA_NOW. */
const NOW_MINUTES = DATA_NOW.getUTCHours() * 60 + DATA_NOW.getUTCMinutes()

function EventRow({ event }: { event: CalendarEvent }) {
  const remove = useCalendar((state) => state.remove)
  const restore = useCalendar((state) => state.restore)
  const calendar = CALENDAR_BY_ID[event.calendar]
  const past = event.date < TODAY || (event.date === TODAY && event.end !== null && minutes(event.end) <= NOW_MINUTES)
  const live = event.date === TODAY && event.start !== null && event.end !== null && minutes(event.start) <= NOW_MINUTES && minutes(event.end) > NOW_MINUTES
  return (
    <li className={cn("group/event relative flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50", past && "[&_.font-medium]:text-muted-foreground")}>
      <div className="flex w-12 shrink-0 flex-col pt-0.5">
        {event.start && event.end ? (
          <>
            <span className="num text-sm font-medium">{event.start}</span>
            <span className="num text-xs text-muted-foreground">{event.end}</span>
          </>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">All day</span>
        )}
      </div>
      <span className={cn("w-0.5 shrink-0 self-stretch rounded-full", calendar.dot)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <span className="min-w-0 flex-1 text-sm font-medium text-pretty">{event.title}</span>
          {live && <span className="mt-0.5 shrink-0 rounded-full bg-success/15 px-1.5 text-[10px] font-semibold text-success">Now</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{calendar.title}</span>
          {event.start && event.end && <span className="num">{duration(event.start, event.end)}</span>}
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3" />
              {event.location}
            </span>
          )}
        </div>
        {event.attendees.length > 0 && (
          <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <UsersIcon className="size-3 shrink-0" />
            <span className="truncate">{event.attendees.map((id) => MEMBERS[id]?.name.split(" ")[0]).join(", ")}</span>
          </span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className="shrink-0 text-muted-foreground" aria-label={`Options for ${event.title}`} />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                remove(event.id)
                toast.add({ title: "Event deleted", description: event.title, actionProps: { children: "Undo", onClick: () => restore(event) } })
              }}
            >
              <Trash2Icon />
              Delete event
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

/** The selected day's events, then the calendars you can show or hide. */
export function Agenda({ events, allEvents, onCreate }: { events: CalendarEvent[]; allEvents: CalendarEvent[]; onCreate: (date: string) => void }) {
  const selected = useCalendar((state) => state.selected)
  const cursor = useCalendar((state) => state.cursor)
  const hidden = useCalendar((state) => state.hidden)
  const toggleCalendar = useCalendar((state) => state.toggleCalendar)
  const dayEvents = sortEvents(events.filter((event) => event.date === selected))
  const timed = dayEvents.filter((event) => event.start && event.end)
  const booked = timed.reduce((sum, event) => sum + minutes(event.end as string) - minutes(event.start as string), 0)

  return (
    <aside aria-label="Agenda" className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-(--surface-shadow) xl:sticky xl:top-20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">{selected === TODAY ? "Today" : "Agenda"}</span>
          <h2 className="font-heading text-lg font-semibold tracking-tight">{formatDay(selected)}</h2>
        </div>
        <Button variant="outline" size="icon-sm" onClick={() => onCreate(selected)} aria-label="Add an event on this day">
          <CalendarPlusIcon />
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        <div className="flex flex-col rounded-xl bg-muted/60 px-3 py-2">
          <dt className="text-[11px] text-muted-foreground">Events</dt>
          <dd className="num text-xl font-semibold">{dayEvents.length}</dd>
        </div>
        <div className="flex flex-col rounded-xl bg-muted/60 px-3 py-2">
          <dt className="text-[11px] text-muted-foreground">Booked</dt>
          <dd className="num text-xl font-semibold">{formatMinutes(booked)}</dd>
        </div>
      </dl>
      {dayEvents.length === 0 ? (
        <Empty className="border border-dashed py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2Icon />
            </EmptyMedia>
            <EmptyTitle>Nothing scheduled</EmptyTitle>
            <EmptyDescription>A clear day. Add an event or pick another day.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => onCreate(selected)}>
              <CalendarPlusIcon data-icon="inline-start" />
              Add event
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="-mx-2.5 flex flex-col gap-0.5">
          {dayEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
      <Separator />
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Calendars</legend>
        {CALENDARS.map((calendar) => {
          const count = allEvents.filter((event) => event.calendar === calendar.id && inMonth(event.date, cursor)).length
          const id = `calendar-${calendar.id}`
          return (
            <label key={calendar.id} htmlFor={id} className="flex h-8 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-sm hover:bg-muted/50">
              <Checkbox id={id} checked={!hidden.includes(calendar.id)} onCheckedChange={() => toggleCalendar(calendar.id)} />
              <span className={cn("size-2 rounded-full", calendar.dot)} aria-hidden />
              <span className="flex-1">{calendar.title}</span>
              <span className="num text-xs text-muted-foreground">{count}</span>
            </label>
          )
        })}
      </fieldset>
    </aside>
  )
}
