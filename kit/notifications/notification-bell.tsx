"use client"

import { ArrowRightIcon, BellIcon, CheckCheckIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { formatRelative } from "../data/format"
import { currentTime } from "@/lib/clock"

export interface BellNotification {
  id: string
  title: string
  body: string
  href: string
  read: boolean
  at: string
  /** What kind of thing it is about, shown as a tile beside it. */
  icon?: React.ComponentType
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Splits notifications into "Today" and "Earlier", dropping empty groups. */
function groups(items: BellNotification[]) {
  const now = currentTime()
  const today = items.filter((item) => sameDay(new Date(item.at), now))
  const earlier = items.filter((item) => !sameDay(new Date(item.at), now))
  return [
    { label: "Today", items: today },
    { label: "Earlier", items: earlier },
  ].filter((group) => group.items.length > 0)
}

function Row({ item, onOpen }: { item: BellNotification; onOpen: () => void }) {
  const Icon = item.icon ?? BellIcon
  return (
    <Item size="sm" className="gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-muted/70" render={<Link href={item.href} onClick={onOpen} />}>
      <ItemMedia variant="icon" className={cn("size-8 self-start rounded-lg transition-colors duration-250", item.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
        <Icon />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle className={cn("w-full justify-between gap-3", item.read && "font-normal text-muted-foreground")}>
          <span className="line-clamp-1">{item.title}</span>
          {/* The unread dot fades out when the item is read. */}
          <span className={cn("size-2 shrink-0 rounded-full bg-primary transition-opacity duration-250", item.read && "opacity-0")} aria-hidden />
        </ItemTitle>
        <ItemDescription className="line-clamp-2 text-xs">{item.body}</ItemDescription>
        <span className="text-xs text-muted-foreground">{formatRelative(item.at)}</span>
      </ItemContent>
      {!item.read && <span className="sr-only">Unread</span>}
    </Item>
  )
}

function List({ items, onOpen, empty }: { items: BellNotification[]; onOpen: (item: BellNotification) => void; empty: { title: string; description: string } }) {
  if (items.length === 0) {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellIcon />
          </EmptyMedia>
          <EmptyTitle>{empty.title}</EmptyTitle>
          <EmptyDescription>{empty.description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }
  return (
    // A fixed-height viewport: switching between All and Unread never resizes the popover.
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-2">
        {groups(items).map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <span className="px-2 pt-1 pb-1 text-xs font-medium text-muted-foreground">{group.label}</span>
            <ItemGroup className="gap-0.5">
              {group.items.map((item) => (
                <Row key={item.id} item={item} onOpen={() => onOpen(item)} />
              ))}
            </ItemGroup>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export function NotificationBell({
  items,
  onMarkRead,
  viewAllHref,
  settingsHref,
  emptyDescription = "New alerts and mentions appear here.",
}: {
  items: BellNotification[]
  onMarkRead: (ids: string[] | "all") => void
  viewAllHref: string
  /** Where notification preferences live, linked from the footer. */
  settingsHref?: string
  /** Under "You are all caught up": what kinds of things land here. */
  emptyDescription?: string
}) {
  const [open, setOpen] = useState(false)
  const unread = items.filter((item) => !item.read)
  const recent = items.slice(0, 12)

  const openItem = (item: BellNotification) => {
    setOpen(false)
    if (!item.read) {
      onMarkRead([item.id])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread.length} unread`} />}>
        <BellIcon />
        {unread.length > 0 && (
          // Keyed by the count, so each new notification pops the dot again.
          <span key={unread.length} className="absolute end-1.5 top-1.5 size-2 animate-pop rounded-full bg-primary ring-2 ring-background" aria-hidden />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0">
        <Tabs defaultValue="all" className="gap-0">
          <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Notifications</span>
              {unread.length > 0 && (
                <Badge key={unread.length} className="animate-pop font-mono tabular-nums">
                  {unread.length}
                </Badge>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="ghost" size="icon-sm" className="-me-1.5 text-muted-foreground" disabled={unread.length === 0} aria-label="Mark all as read" onClick={() => onMarkRead("all")} />}
              >
                <CheckCheckIcon />
              </TooltipTrigger>
              <TooltipContent>Mark all as read</TooltipContent>
            </Tooltip>
          </div>
          <div className="px-4">
            <TabsList variant="line" className="h-8 gap-4 p-0">
              <TabsTrigger value="all" className="flex-none px-0">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-none px-0">
                Unread
              </TabsTrigger>
            </TabsList>
          </div>
          <Separator />
          <TabsContent value="all" className="h-[26rem] flex-none">
            <List items={recent} onOpen={openItem} empty={{ title: "You are all caught up", description: emptyDescription }} />
          </TabsContent>
          <TabsContent value="unread" className="h-[26rem] flex-none">
            <List items={unread.slice(0, 12)} onOpen={openItem} empty={{ title: "Nothing unread", description: "You have seen everything. New alerts will show up here." }} />
          </TabsContent>
        </Tabs>
        <Separator />
        <div className="flex items-center justify-between p-1.5">
          {settingsHref ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground" nativeButton={false} render={<Link href={settingsHref} onClick={() => setOpen(false)} />}>
              <SettingsIcon data-icon="inline-start" />
              Settings
            </Button>
          ) : (
            <span />
          )}
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={viewAllHref} onClick={() => setOpen(false)} />}>
            View all
            <ArrowRightIcon data-icon="inline-end" className="rtl:rotate-180" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
