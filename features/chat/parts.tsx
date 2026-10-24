import { HashIcon } from "lucide-react"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/kit/shell/nav-user"
import { cn } from "@/lib/utils"

import { MEMBERS, ME_ID, type Conversation, type Presence } from "./data"

export const PRESENCE_LABEL: Record<Presence, string> = { online: "Online", away: "Away", offline: "Offline" }
const PRESENCE_TONE: Record<Presence, string> = { online: "bg-success", away: "bg-warning", offline: "bg-muted-foreground/50" }

/** The other person in a direct chat, or null for a group. */
export function directPartner(conversation: Conversation) {
  if (conversation.name) {
    return null
  }
  const id = conversation.memberIds.find((memberId) => memberId !== ME_ID)
  return id ? MEMBERS[id] : null
}

export function conversationTitle(conversation: Conversation): string {
  return conversation.name ?? directPartner(conversation)?.name ?? "Conversation"
}

export function PersonAvatar({ memberId, size = "md", showPresence = false, className }: { memberId: string; size?: "sm" | "md"; showPresence?: boolean; className?: string }) {
  const member = MEMBERS[memberId]
  return (
    <Avatar className={cn(size === "sm" ? "size-7" : "size-9", className)}>
      <AvatarFallback className={cn("font-medium", size === "sm" ? "text-[10px]" : "text-xs", memberId === ME_ID ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
        {initials(member?.name ?? "?")}
      </AvatarFallback>
      {showPresence && member && <AvatarBadge className={cn("ring-card", PRESENCE_TONE[member.presence])} aria-hidden />}
    </Avatar>
  )
}

/** A direct chat shows the person (with presence); a group shows a channel tile. */
export function ConversationAvatar({ conversation }: { conversation: Conversation }) {
  const partner = directPartner(conversation)
  if (partner) {
    return <PersonAvatar memberId={partner.id} showPresence />
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-chart-2/15 text-chart-2" aria-hidden>
      <HashIcon className="size-4" />
    </span>
  )
}
