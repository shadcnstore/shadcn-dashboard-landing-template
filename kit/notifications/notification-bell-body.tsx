"use client"

import { ArrowRightIcon, BellIcon, CheckCheckIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { formatRelative } from "../data/format"
import { currentTime } from "@/lib/clock"

import type { BellNotification } from "./notification-bell"

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

export interface NotificationBellBodyProps {
  recent: BellNotification[]
  unread: BellNotification[]
  onMarkRead: (ids: string[] | "all") => void
  openItem: (item: BellNotification) => void
  close: () => void
  viewAllHref: string
  settingsHref?: string
  emptyDescription: string
}

/** The bell's popover contents, loaded by `NotificationBell` the first time it opens. */
export default function NotificationBellBody({ recent, unread, onMarkRead, openItem, close, viewAllHref, settingsHref, emptyDescription }: NotificationBellBodyProps) {
  return (
    <>
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
        <Button variant="ghost" size="sm" className="text-muted-foreground" nativeButton={false} render={<Link href={settingsHref} onClick={close} />}>
          <SettingsIcon data-icon="inline-start" />
          Settings
        </Button>
      ) : (
        <span />
      )}
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={viewAllHref} onClick={close} />}>
        View all
        <ArrowRightIcon data-icon="inline-end" className="rtl:rotate-180" />
      </Button>
    </div>
    </>
  )
}
