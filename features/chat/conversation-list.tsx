"use client"

import { BellOffIcon, MessagesSquareIcon, SearchIcon, XIcon } from "lucide-react"
import { useMemo } from "react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { formatShortTime } from "@/features/mail/format"
import { cn } from "@/lib/utils"

import { MEMBERS, ME_ID, type Conversation } from "./data"
import { ConversationAvatar, conversationTitle } from "./parts"
import { useChat } from "./store"

function Row({ conversation, active, onSelect }: { conversation: Conversation; active: boolean; onSelect: () => void }) {
  const last = conversation.messages.at(-1)
  const title = conversationTitle(conversation)
  const sender = last ? (last.senderId === ME_ID ? "You" : conversation.name ? MEMBERS[last.senderId]?.name.split(" ")[0] : null) : null
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50",
        active && "bg-accent hover:bg-accent"
      )}
    >
      <ConversationAvatar conversation={conversation} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className={cn("min-w-0 flex-1 truncate text-sm", conversation.unread ? "font-semibold" : "font-medium")}>{title}</span>
          {conversation.muted && <BellOffIcon className="size-3 shrink-0 text-muted-foreground" aria-label="Muted" />}
          {last && <span className="num shrink-0 text-[11px] text-muted-foreground">{formatShortTime(last.sentAt)}</span>}
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("min-w-0 flex-1 truncate text-xs", conversation.unread ? "text-foreground" : "text-muted-foreground")}>
            {sender && <span className="text-muted-foreground">{sender}: </span>}
            {last?.text}
          </span>
          {conversation.unread > 0 && (
            <span className="num flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {conversation.unread}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function Section({ title, conversations, selectedId, onSelect }: { title: string; conversations: Conversation[]; selectedId: string | null; onSelect: (id: string) => void }) {
  if (conversations.length === 0) {
    return null
  }
  return (
    <div className="flex flex-col gap-1">
      <h2 className="px-2.5 pt-2 text-xs font-medium text-muted-foreground">{title}</h2>
      <ul className="flex flex-col gap-0.5">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <Row conversation={conversation} active={conversation.id === selectedId} onSelect={() => onSelect(conversation.id)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Pinned and recent conversations with a search over names and messages. */
export function ConversationList({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const conversations = useChat((state) => state.conversations)
  const query = useChat((state) => state.query)
  const setQuery = useChat((state) => state.setQuery)

  const { pinned, recent } = useMemo(() => {
    const text = query.trim().toLowerCase()
    const matches = conversations
      .filter((conversation) => !text || `${conversationTitle(conversation)} ${conversation.messages.map((message) => message.text).join(" ")}`.toLowerCase().includes(text))
      .sort((a, b) => (b.messages.at(-1)?.sentAt ?? "").localeCompare(a.messages.at(-1)?.sentAt ?? ""))
    return { pinned: matches.filter((conversation) => conversation.pinned), recent: matches.filter((conversation) => !conversation.pinned) }
  }, [conversations, query])
  const unread = conversations.reduce((sum, conversation) => sum + (conversation.muted ? 0 : conversation.unread), 0)

  return (
    <nav aria-label="Conversations" className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="flex items-center gap-2 ps-1">
          <h1 className="font-heading text-lg font-semibold tracking-tight">Chat</h1>
          {unread > 0 && <span className="num text-xs text-primary">{unread} unread</span>}
        </div>
        <InputGroup className="h-8">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search conversations" aria-label="Search conversations" value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery("")}>
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]">
        {pinned.length + recent.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessagesSquareIcon />
              </EmptyMedia>
              <EmptyTitle>No matches</EmptyTitle>
              <EmptyDescription>No conversation mentions &ldquo;{query}&rdquo;.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            <Section title="Pinned" conversations={pinned} selectedId={selectedId} onSelect={onSelect} />
            <Section title="Recent" conversations={recent} selectedId={selectedId} onSelect={onSelect} />
          </div>
        )}
      </div>
    </nav>
  )
}
