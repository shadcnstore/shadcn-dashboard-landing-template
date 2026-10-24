"use client"

import { ArchiveIcon, FileTextIcon, InboxIcon, PenSquareIcon, SendIcon, StarIcon, Trash2Icon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { LABELS } from "./data"
import { useMail, type MailView } from "./store"

export const VIEWS: { id: MailView; title: string; icon: LucideIcon }[] = [
  { id: "inbox", title: "Inbox", icon: InboxIcon },
  { id: "starred", title: "Starred", icon: StarIcon },
  { id: "drafts", title: "Drafts", icon: FileTextIcon },
  { id: "sent", title: "Sent", icon: SendIcon },
  { id: "archive", title: "Archive", icon: ArchiveIcon },
  { id: "trash", title: "Trash", icon: Trash2Icon },
]

/** Unread count for the inbox, totals for drafts; other views show none. */
function useCounts(): Partial<Record<MailView, number>> {
  const mails = useMail((state) => state.mails)
  return {
    inbox: mails.filter((mail) => mail.folder === "inbox" && !mail.read).length,
    starred: mails.filter((mail) => mail.starred && mail.folder !== "trash").length,
    drafts: mails.filter((mail) => mail.folder === "drafts").length,
  }
}

/** The left pane on wide screens: compose, folders and labels. */
export function MailFolders({ onCompose }: { onCompose: () => void }) {
  const view = useMail((state) => state.view)
  const label = useMail((state) => state.label)
  const setView = useMail((state) => state.setView)
  const setLabel = useMail((state) => state.setLabel)
  const counts = useCounts()

  return (
    <nav aria-label="Mail folders" className="flex h-full flex-col gap-5 overflow-y-auto p-3">
      <Button onClick={onCompose} className="w-full">
        <PenSquareIcon data-icon="inline-start" />
        Compose
      </Button>
      <ul className="flex flex-col gap-0.5">
        {VIEWS.map((item) => {
          const active = view === item.id
          const count = counts[item.id]
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setView(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  active && "bg-muted font-medium text-foreground"
                )}
              >
                <item.icon className={cn("size-4", active && "text-primary")} />
                <span className="flex-1 text-start">{item.title}</span>
                {count ? <span className={cn("num text-xs", item.id === "inbox" ? "text-primary" : "text-muted-foreground")}>{count}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-col gap-1">
        <span className="px-2.5 text-xs font-medium text-muted-foreground">Labels</span>
        <ul className="flex flex-col gap-0.5">
          {LABELS.map((item) => {
            const active = label === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setLabel(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    active && "bg-muted font-medium text-foreground"
                  )}
                >
                  <span className={cn("size-2 rounded-full", item.tone)} aria-hidden />
                  {item.title}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/** The folder switch on narrow screens, where the folder pane is hidden. */
export function FolderSelect() {
  const view = useMail((state) => state.view)
  const setView = useMail((state) => state.setView)
  const counts = useCounts()
  const items = VIEWS.map((item) => ({ value: item.id, label: item.title }))

  return (
    <Select items={items} value={view} onValueChange={(next) => next && setView(next as MailView)}>
      <SelectTrigger aria-label="Folder" className="h-8 border-none bg-transparent ps-1 text-lg font-semibold tracking-tight shadow-none dark:bg-transparent">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {VIEWS.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <item.icon />
              {item.title}
              {counts[item.id] ? <span className="num ms-auto text-xs text-muted-foreground">{counts[item.id]}</span> : null}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
