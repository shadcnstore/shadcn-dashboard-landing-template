"use client"

import { ArrowLeftIcon, BellIcon, BellOffIcon, PaperclipIcon, PinIcon, PinOffIcon, SendHorizontalIcon } from "lucide-react"
import { Fragment, useLayoutEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { daysAgo, formatClock, formatDayHeading } from "@/features/mail/format"
import { cn } from "@/lib/utils"

import { MEMBERS, ME_ID, type ChatMessage, type Conversation } from "./data"
import { ConversationAvatar, PersonAvatar, PRESENCE_LABEL, conversationTitle, directPartner } from "./parts"
import { useChat } from "./store"

/** Messages closer than five minutes from the same sender stack into one group. */
const GROUP_GAP = 5 * 60 * 1000

interface Group {
  key: string
  senderId: string
  day: string | null
  messages: ChatMessage[]
}

function groupMessages(messages: ChatMessage[]): Group[] {
  const groups: Group[] = []
  messages.forEach((message, index) => {
    const previous = messages[index - 1]
    const newDay = !previous || daysAgo(previous.sentAt) !== daysAgo(message.sentAt)
    const last = groups.at(-1)
    if (last && !newDay && last.senderId === message.senderId && new Date(message.sentAt).getTime() - new Date(previous.sentAt).getTime() < GROUP_GAP) {
      last.messages.push(message)
      return
    }
    groups.push({ key: message.id, senderId: message.senderId, day: newDay ? formatDayHeading(message.sentAt) : null, messages: [message] })
  })
  return groups
}

function DayMarker({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function MessageGroup({ group, isGroupChat }: { group: Group; isGroupChat: boolean }) {
  const mine = group.senderId === ME_ID
  const sender = MEMBERS[group.senderId]
  return (
    <div className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
      {!mine && <PersonAvatar memberId={group.senderId} size="sm" className="mb-0.5" />}
      <div className={cn("flex max-w-[85%] min-w-0 flex-col gap-1 sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        <div className={cn("flex items-baseline gap-2 px-1 text-xs", mine && "flex-row-reverse")}>
          {!mine && isGroupChat && <span className="font-medium">{sender?.name}</span>}
          <time dateTime={group.messages[0].sentAt} className="num text-[11px] text-muted-foreground">
            {formatClock(group.messages[0].sentAt)}
          </time>
        </div>
        {group.messages.map((message, index) => (
          <p
            key={message.id}
            className={cn(
              "w-fit rounded-2xl px-3.5 py-2 text-sm leading-relaxed text-pretty break-words",
              // Only messages sent in this session rise in; the history is simply there.
              message.id.includes("_new_") && "transition-[opacity,translate] duration-200 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none",
              mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              mine ? index === group.messages.length - 1 && "rounded-br-md" : index === group.messages.length - 1 && "rounded-bl-md"
            )}
          >
            {message.text}
          </p>
        ))}
      </div>
    </div>
  )
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5" aria-live="polite">
      <span className="flex h-8 items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 motion-reduce:animate-none" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">{name} is typing</span>
    </div>
  )
}

function Composer({ conversation }: { conversation: Conversation }) {
  const send = useChat((state) => state.send)
  const [text, setText] = useState("")
  const submit = () => {
    const value = text.trim()
    if (!value) {
      return
    }
    send(conversation.id, value)
    setText("")
  }
  return (
    <form
      className="shrink-0 p-3 pt-0"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <InputGroup className="rounded-xl">
        <InputGroupTextarea
          aria-label={`Message ${conversationTitle(conversation)}`}
          placeholder={`Message ${conversationTitle(conversation)}`}
          rows={1}
          className="max-h-32 min-h-10 py-2.5"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
        />
        <InputGroupAddon align="inline-end" className="self-end pb-1.5">
          <InputGroupButton size="icon-sm" aria-label="Attach a file" onClick={() => toast.add({ title: "Attachments are off in the demo" })}>
            <PaperclipIcon />
          </InputGroupButton>
          <InputGroupButton type="submit" variant="default" size="icon-sm" aria-label="Send" disabled={!text.trim()}>
            <SendHorizontalIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-1.5 hidden px-1 text-[11px] text-muted-foreground sm:block">Enter to send, Shift Enter for a new line</p>
    </form>
  )
}

/** One conversation: header with pin and mute, the message history and the composer. */
export function Thread({ conversation, onBack }: { conversation: Conversation; onBack?: () => void }) {
  const typing = useChat((state) => state.typing.includes(conversation.id))
  const togglePinned = useChat((state) => state.togglePinned)
  const toggleMuted = useChat((state) => state.toggleMuted)
  const scroller = useRef<HTMLDivElement>(null)
  const partner = directPartner(conversation)
  const title = conversationTitle(conversation)
  const groups = groupMessages(conversation.messages)
  const responder = conversation.memberIds.find((id) => id !== ME_ID)

  // Open at the latest message, and follow new ones (and the typing dots) as they arrive.
  useLayoutEffect(() => {
    const node = scroller.current
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: conversation.messages.length > 0 && node.scrollTop > 0 ? "smooth" : "instant" })
    }
  }, [conversation.id, conversation.messages.length, typing])

  return (
    <section aria-label={`Conversation with ${title}`} className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3">
        {onBack && (
          <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back to conversations">
            <ArrowLeftIcon />
          </Button>
        )}
        <ConversationAvatar conversation={conversation} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {partner ? `${PRESENCE_LABEL[partner.presence]} · ${partner.title}` : `${conversation.memberIds.length} members · ${conversation.topic}`}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={conversation.pinned}
                  aria-label={conversation.pinned ? "Unpin conversation" : "Pin conversation"}
                  onClick={() => togglePinned(conversation.id)}
                />
              }
            >
              {conversation.pinned ? <PinOffIcon /> : <PinIcon />}
            </TooltipTrigger>
            <TooltipContent>{conversation.pinned ? "Unpin" : "Pin"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={conversation.muted}
                  aria-label={conversation.muted ? "Unmute conversation" : "Mute conversation"}
                  onClick={() => {
                    toggleMuted(conversation.id)
                    toast.add({ title: conversation.muted ? "Notifications on" : "Conversation muted", description: title })
                  }}
                />
              }
            >
              {conversation.muted ? <BellOffIcon /> : <BellIcon />}
            </TooltipTrigger>
            <TooltipContent>{conversation.muted ? "Unmute" : "Mute"}</TooltipContent>
          </Tooltip>
        </div>
      </header>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]" role="log" aria-label="Messages" tabIndex={0}>
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3 py-4 sm:px-5">
          {groups.map((group) => (
            <Fragment key={group.key}>
              {group.day && <DayMarker label={group.day} />}
              <MessageGroup group={group} isGroupChat={!partner} />
            </Fragment>
          ))}
          {typing && responder && <TypingIndicator name={MEMBERS[responder]?.name.split(" ")[0] ?? "Someone"} />}
        </div>
      </div>
      <Composer key={conversation.id} conversation={conversation} />
    </section>
  )
}
