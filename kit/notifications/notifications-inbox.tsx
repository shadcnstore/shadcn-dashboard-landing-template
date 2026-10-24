"use client"

import { ArrowRightIcon, BellIcon, BellOffIcon, CheckCheckIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { formatDate, formatRelative } from "../data/format"
import { IconTile, TILE_TONES, type TileTone } from "../ui-patterns/icon-tile"
import { EmptyState, ErrorState } from "../ui-patterns/query-state"
import { Segmented } from "../ui-patterns/segmented"
import { Widget } from "../widgets/widget"
import type { BellNotification } from "./notification-bell"
import { currentTime } from "@/lib/clock"

export interface InboxCategory {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  tone: TileTone
}

/** A notification that also says which category it belongs to. */
export type InboxNotification = BellNotification & { category?: string }

function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = currentTime()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }
  return formatDate(iso)
}

/**
 * Every notification, grouped by day. With `categories`, a row of counts at
 * the top doubles as a filter, and each row gets its category's tile. Opening
 * one marks it read; the check on hover marks it read without leaving.
 */
export function NotificationsInbox({
  items,
  categories,
  loading,
  error,
  onRetry,
  onMarkRead,
}: {
  items: InboxNotification[] | undefined
  categories?: InboxCategory[]
  loading: boolean
  /** Set when the list failed to load; shows the error state with a retry. */
  error?: unknown
  onRetry?: () => void
  onMarkRead: (ids: string[] | "all") => void
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [category, setCategory] = useState<string | null>(null)
  const all = items ?? []
  const list = all
    .filter((item) => (filter === "all" || !item.read) && (category === null || item.category === category))
    .sort((a, b) => b.at.localeCompare(a.at))
  const unread = all.filter((item) => !item.read).length
  const look = (id?: string) => categories?.find((entry) => entry.id === id)
  const days: { label: string; items: InboxNotification[] }[] = []
  for (const item of list) {
    const label = dayLabel(item.at)
    const last = days.at(-1)
    if (last?.label === label) {
      last.items.push(item)
    } else {
      days.push({ label, items: [item] })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {categories && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Filter by category">
          {categories.map((entry) => {
            const inCategory = all.filter((item) => item.category === entry.id)
            const fresh = inCategory.filter((item) => !item.read).length
            const selected = category === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(selected ? null : entry.id)}
                className={cn(
                  "group/cat flex flex-col gap-3 rounded-2xl bg-card p-4 text-start shadow-(--surface-shadow) ring-1 ring-foreground/5 transition-[box-shadow,translate] duration-150 ease-smooth-out outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center justify-between">
                  <IconTile icon={entry.icon} tone={entry.tone} size="sm" />
                  {fresh > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-foreground tabular-nums">{fresh} new</span>
                  )}
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{entry.label}</span>
                  <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{loading ? "–" : inCategory.length}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            aria-label="Show"
            className="w-auto"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: `Unread${unread ? ` (${unread})` : ""}` },
            ]}
          />
          {category && (
            <Button variant="ghost" size="sm" className="animate-rise text-muted-foreground" onClick={() => setCategory(null)}>
              {look(category)?.label} only · Show all
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" disabled={unread === 0} onClick={() => onMarkRead("all")}>
          <CheckCheckIcon data-icon="inline-start" />
          Mark all as read
        </Button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : loading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : days.length === 0 ? (
        <EmptyState
          icon={BellOffIcon}
          className="rounded-2xl border bg-card"
          title={filter === "unread" ? "You are all caught up" : "No notifications yet"}
          description={filter === "unread" ? "Nothing new since you last looked." : "Orders, stock alerts and reviews will show up here."}
        />
      ) : (
        days.map((day) => (
          <section key={day.label} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
              {day.label}
              <span className="font-mono tabular-nums">{day.items.length}</span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </h2>
            <Widget className="gap-0 p-1.5">
              <ul className="flex flex-col">
                {day.items.map((item) => {
                  const kind = look(item.category)
                  const Icon = kind?.icon ?? item.icon ?? BellIcon
                  return (
                    <li key={item.id} className="group/row relative flex animate-rise items-start gap-3 rounded-xl p-3 transition-colors duration-150 hover:bg-muted/50">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-250 [&>svg]:size-4",
                          item.read ? "bg-muted text-muted-foreground" : TILE_TONES[kind?.tone ?? "lead"]
                        )}
                        aria-hidden
                      >
                        <Icon />
                      </span>
                      <Link href={item.href} onClick={() => !item.read && onMarkRead([item.id])} className="flex min-w-0 flex-1 flex-col gap-0.5 outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
                        <span className={cn("flex items-center gap-2 text-sm", item.read ? "text-muted-foreground" : "font-semibold")}>
                          {item.title}
                          <span className={cn("size-2 shrink-0 rounded-full bg-primary transition-[opacity,scale] duration-250", item.read && "scale-0 opacity-0")} aria-label={item.read ? undefined : "Unread"} />
                        </span>
                        <span className="text-sm text-muted-foreground">{item.body}</span>
                        {kind && <span className="text-xs text-muted-foreground/80">{kind.label}</span>}
                      </Link>
                      <div className="relative flex shrink-0 flex-col items-end gap-1.5">
                        <time dateTime={item.at} className="text-xs text-muted-foreground">
                          {formatRelative(item.at)}
                        </time>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-focus-within/row:opacity-100 group-hover/row:opacity-100">
                          {!item.read && (
                            <Tooltip>
                              <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Mark "${item.title}" as read`} onClick={() => onMarkRead([item.id])} />}>
                                <CheckIcon />
                              </TooltipTrigger>
                              <TooltipContent>Mark as read</TooltipContent>
                            </Tooltip>
                          )}
                          <ArrowRightIcon className="size-3.5 text-muted-foreground rtl:rotate-180" aria-hidden />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Widget>
          </section>
        ))
      )}
    </div>
  )
}
