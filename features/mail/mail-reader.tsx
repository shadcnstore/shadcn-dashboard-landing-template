"use client"

import {
  ArchiveIcon,
  ArrowLeftIcon,
  FileIcon,
  ForwardIcon,
  MailIcon,
  MailOpenIcon,
  MoreHorizontalIcon,
  ReplyAllIcon,
  ReplyIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { avatarFor } from "@/lib/avatars"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatMoney } from "@/kit/data/format"
import { initials } from "@/kit/shell/nav-user"
import { cn } from "@/lib/utils"

import type { Mail } from "./data"
import { formatFull } from "./format"
import { useMail } from "./store"

function ToolbarButton({ label, onClick, children, disabled }: { label: string; onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} disabled={disabled} />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Plan, MRR, seats and renewal of the customer who wrote, so the reply has context. */
function AccountStrip({ account }: { account: NonNullable<Mail["account"]> }) {
  const usage = account.seats / account.seatLimit
  const stats = [
    { label: "Plan", value: account.plan },
    { label: "MRR", value: account.mrrCents ? formatMoney(account.mrrCents, { compact: true }) : "Trial" },
    { label: "Seats", value: `${account.seats}/${account.seatLimit}`, hot: usage >= 0.9 },
    { label: "Renews", value: account.renewsOn.replace(/, \d{4}$/, "") },
  ]
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm font-medium">{account.name}</span>
      <dl className="grid grid-cols-4 gap-3 sm:ms-auto sm:flex sm:gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col">
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className={cn("num truncate text-sm font-medium", stat.hot && "text-warning-foreground dark:text-warning")}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ReplyBox({ mail }: { mail: Mail }) {
  const [text, setText] = useState("")
  const first = mail.from.name.split(" ")[0]
  const send = () => {
    if (!text.trim()) {
      return
    }
    setText("")
    toast.add({ type: "success", title: "Reply sent", description: `${first} will see it in their inbox.` })
  }
  return (
    <form
      className="border-t p-3"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          aria-label={`Reply to ${mail.from.name}`}
          placeholder={`Reply to ${first}…`}
          className="max-h-40 min-h-16"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              send()
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <span className="text-xs text-muted-foreground">⌘ Enter to send</span>
          <InputGroupButton type="submit" variant="default" size="sm" className="ms-auto" disabled={!text.trim()}>
            Send
            <SendIcon data-icon="inline-end" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

/** The open message: actions, sender, customer context, body and a quick reply. */
export function MailReader({ mail, onBack }: { mail: Mail | null; onBack?: () => void }) {
  const setRead = useMail((state) => state.setRead)
  const toggleStar = useMail((state) => state.toggleStar)
  const move = useMail((state) => state.move)

  if (!mail) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailIcon />
          </EmptyMedia>
          <EmptyTitle>No message open</EmptyTitle>
          <EmptyDescription>Pick a message from the list to read it here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const moveTo = (folder: "archive" | "trash" | "inbox", title: string) => {
    const previous = mail.folder
    move(mail.id, folder)
    toast.add({
      title,
      description: mail.subject,
      actionProps: { children: "Undo", onClick: () => move(mail.id, previous) },
    })
    onBack?.()
  }

  const outgoing = mail.folder === "sent" || mail.folder === "drafts"

  return (
    <article aria-label={mail.subject} className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-0.5 border-b px-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="me-1">
            <ArrowLeftIcon data-icon="inline-start" />
            Back
          </Button>
        )}
        {mail.folder === "archive" || mail.folder === "trash" ? (
          <ToolbarButton label="Move to inbox" onClick={() => moveTo("inbox", "Moved to inbox")}>
            <UndoIcon />
          </ToolbarButton>
        ) : (
          <ToolbarButton label="Archive" onClick={() => moveTo("archive", "Archived")}>
            <ArchiveIcon />
          </ToolbarButton>
        )}
        {mail.folder !== "trash" && (
          <ToolbarButton label="Move to trash" onClick={() => moveTo("trash", "Moved to trash")}>
            <Trash2Icon />
          </ToolbarButton>
        )}
        <ToolbarButton
          label="Mark as unread"
          onClick={() => {
            setRead(mail.id, false)
            onBack?.()
          }}
        >
          <MailOpenIcon />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 data-vertical:h-4 data-vertical:self-center" />
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={mail.starred ? "Unstar" : "Star"} aria-pressed={mail.starred} onClick={() => toggleStar(mail.id)} />}>
            <StarIcon className={cn(mail.starred && "fill-warning text-warning")} />
          </TooltipTrigger>
          <TooltipContent>{mail.starred ? "Unstar" : "Star"}</TooltipContent>
        </Tooltip>
        <div className="ms-auto flex items-center gap-0.5">
          <span className="hidden sm:contents">
            <ToolbarButton label="Reply all" onClick={() => toast.add({ title: "Reply all", description: "Write your reply in the box below." })}>
              <ReplyAllIcon />
            </ToolbarButton>
            <ToolbarButton label="Forward" onClick={() => toast.add({ title: "Forwarding is off in the demo" })}>
              <ForwardIcon />
            </ToolbarButton>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More actions" />}>
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => toast.add({ title: "Reply", description: "Write your reply in the box below." })}>
                  <ReplyIcon />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.add({ type: "success", title: "Thread muted", description: "New replies will skip your inbox." })}>
                  <MailIcon />
                  Mute thread
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 sm:p-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-balance">{mail.subject}</h2>
          <div className="flex items-start gap-3">
            <Avatar className="size-9">
              {avatarFor(mail.from.name) && <AvatarImage src={avatarFor(mail.from.name)!} alt="" loading="lazy" />}
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials(mail.from.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium">{mail.from.name}</span>
                <span className="truncate text-xs text-muted-foreground">{mail.from.email}</span>
              </div>
              <span className="truncate text-xs text-muted-foreground">To: {outgoing ? mail.to : "me"}</span>
            </div>
            <time dateTime={mail.date} className="num hidden shrink-0 text-xs text-muted-foreground sm:block">
              {formatFull(mail.date)}
            </time>
          </div>
          {mail.account && <AccountStrip account={mail.account} />}
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
            {mail.body.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
          {mail.attachments && (
            <ul className="flex flex-wrap gap-2" aria-label="Attachments">
              {mail.attachments.map((file) => (
                <li key={file.name} className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileIcon className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="num text-xs text-muted-foreground">{file.size}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {!outgoing && <ReplyBox key={mail.id} mail={mail} />}
    </article>
  )
}
