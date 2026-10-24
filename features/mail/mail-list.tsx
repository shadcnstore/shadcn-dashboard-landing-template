"use client"

import { InboxIcon, PaperclipIcon, PenSquareIcon, SearchIcon, StarIcon, XIcon } from "lucide-react"
import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Segmented } from "@/kit/ui-patterns/segmented"
import { cn } from "@/lib/utils"

import { LABELS, type Mail } from "./data"
import { formatShortTime } from "./format"
import { FolderSelect, VIEWS } from "./mail-folders"
import { useMail, visibleMails } from "./store"

const LABEL_TONE = Object.fromEntries(LABELS.map((label) => [label.id, label])) as Record<string, (typeof LABELS)[number]>

function MailRow({ mail, selected, onSelect }: { mail: Mail; selected: boolean; onSelect: () => void }) {
  const showRecipient = mail.folder === "sent" || mail.folder === "drafts"
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group/row relative flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-start transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "bg-accent hover:bg-accent"
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn("size-1.5 shrink-0 rounded-full", mail.read ? "bg-transparent" : "bg-primary")} aria-hidden />
        <span className={cn("min-w-0 flex-1 truncate text-sm", mail.read ? "text-foreground/80" : "font-semibold text-foreground")}>
          {showRecipient ? `To: ${mail.to}` : mail.from.name}
        </span>
        {mail.attachments && <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" aria-label="Has attachments" />}
        {mail.starred && <StarIcon className="size-3.5 shrink-0 fill-warning text-warning" aria-label="Starred" />}
        <span className={cn("num shrink-0 text-xs", selected ? "text-foreground" : "text-muted-foreground")}>{formatShortTime(mail.date)}</span>
      </span>
      <span className={cn("truncate ps-3.5 text-sm", mail.read ? "text-muted-foreground" : "font-medium text-foreground")}>{mail.subject}</span>
      <span className="line-clamp-1 ps-3.5 text-xs text-muted-foreground">{mail.body.filter((line) => !/^(hi|hello|morning)\b/i.test(line)).join(" ")}</span>
      {(mail.labels.length > 0 || mail.account) && (
        <span className="flex flex-wrap items-center gap-1.5 ps-3.5 pt-1">
          {mail.account && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{mail.account.name}</span>}
          {mail.labels.map((label) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-md px-1 text-[11px] text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", LABEL_TONE[label].tone)} aria-hidden />
              {LABEL_TONE[label].title}
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

/** The message list: folder title, All / Unread, search and the rows. */
export function MailList({ showFolderSelect, highlightSelected = true, onCompose, onOpen }: { showFolderSelect: boolean; /** Off on phones, where the list and the reader never show together. */ highlightSelected?: boolean; onCompose: () => void; onOpen?: () => void }) {
  const { mails, view, label, unreadOnly, query, selectedId } = useMail(
    useShallow((state) => ({ mails: state.mails, view: state.view, label: state.label, unreadOnly: state.unreadOnly, query: state.query, selectedId: state.selectedId }))
  )
  const setUnreadOnly = useMail((state) => state.setUnreadOnly)
  const setQuery = useMail((state) => state.setQuery)
  const setLabel = useMail((state) => state.setLabel)
  const select = useMail((state) => state.select)
  const rows = useMemo(() => visibleMails({ mails, view, label, unreadOnly, query }), [mails, view, label, unreadOnly, query])
  const title = VIEWS.find((item) => item.id === view)?.title ?? "Inbox"
  const unread = rows.filter((mail) => !mail.read).length

  return (
    <section aria-label={`${title} messages`} className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="flex items-center gap-2">
          <h1 className="sr-only">Mail</h1>
          {showFolderSelect ? (
            <FolderSelect />
          ) : (
            <h2 className="ps-1 font-heading text-lg font-semibold tracking-tight">{title}</h2>
          )}
          {label && (
            <button
              type="button"
              onClick={() => setLabel(label)}
              className="inline-flex h-6 items-center gap-1 rounded-md bg-muted px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={`Remove the ${LABEL_TONE[label].title} filter`}
            >
              <span className={cn("size-1.5 rounded-full", LABEL_TONE[label].tone)} aria-hidden />
              {LABEL_TONE[label].title}
              <XIcon className="size-3" />
            </button>
          )}
          <span className="num ms-auto text-xs text-muted-foreground">{unread > 0 ? `${unread} unread` : `${rows.length}`}</span>
          {showFolderSelect && (
            <Button size="icon-sm" onClick={onCompose} aria-label="Compose">
              <PenSquareIcon />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <InputGroup className="h-8 flex-1">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search mail" aria-label="Search mail" value={query} onChange={(event) => setQuery(event.target.value)} />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery("")}>
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Segmented
            aria-label="Show"
            className="w-auto"
            value={unreadOnly ? "unread" : "all"}
            onChange={(next) => setUnreadOnly(next === "unread")}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
            ]}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]">
        {rows.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>{query ? "No matches" : "Nothing here"}</EmptyTitle>
              <EmptyDescription>{query ? `No message in ${title} mentions "${query}".` : unreadOnly ? "You are all caught up." : `${title} is empty.`}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {rows.map((mail) => (
              <li key={mail.id}>
                <MailRow mail={mail} selected={highlightSelected && mail.id === selectedId} onSelect={() => {
                    select(mail.id)
                    onOpen?.()
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
