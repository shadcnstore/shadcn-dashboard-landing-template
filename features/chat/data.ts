import { TEAM } from "@/data/names"
import type { TeamMember } from "@/data/schema"
import { DATA_NOW } from "@/lib/clock"

/**
 * Tidewell's team chat, seen by Maya Okafor. Timestamps are built back from
 * DATA_NOW so every visit shows the same history.
 */

export const ME_ID = "tm_maya"

export type Presence = "online" | "away" | "offline"

export interface ChatMember extends TeamMember {
  presence: Presence
}

const PRESENCE: Record<string, Presence> = {
  tm_maya: "online",
  tm_soren: "online",
  tm_priya: "away",
  tm_diego: "online",
  tm_hana: "online",
  tm_tariq: "away",
  tm_freya: "offline",
  tm_emeka: "online",
}

export const MEMBERS: Record<string, ChatMember> = Object.fromEntries(TEAM.map((member) => [member.id, { ...member, presence: PRESENCE[member.id] ?? "offline" }]))

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  sentAt: string
}

export interface Conversation {
  id: string
  /** Group chats have a name; direct chats take the other person's. */
  name?: string
  topic?: string
  memberIds: string[]
  unread: number
  pinned: boolean
  muted: boolean
  messages: ChatMessage[]
}

function at(days: number, time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const date = new Date(DATA_NOW.getTime())
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(hours, minutes, 0, 0)
  return date.toISOString()
}

type Line = [senderId: string, days: number, time: string, text: string]

function thread(id: string, lines: Line[]): ChatMessage[] {
  return lines.map(([senderId, days, time, text], index) => ({ id: `${id}_${index + 1}`, senderId, sentAt: at(days, time), text }))
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c_diego",
    memberIds: [ME_ID, "tm_diego"],
    unread: 2,
    pinned: true,
    muted: false,
    messages: thread("c_diego", [
      ["tm_diego", 1, "16:02", "Cobble Learning still hasn't accepted the owner invite. I'll try their new ops lead directly."],
      [ME_ID, 1, "16:10", "Good idea. Offer the walkthrough and a temporary admin seat, I'm fine with both."],
      ["tm_diego", 1, "16:11", "Perfect, thanks."],
      ["tm_diego", 0, "11:20", "They replied! Walkthrough booked for Thursday at 15:00 UTC."],
      ["tm_diego", 0, "11:21", "Their new owner wants to see the cohort report first, so I'll lead with that."],
    ]),
  },
  {
    id: "c_renewals",
    name: "Q4 renewals",
    topic: "Accounts renewing before 31 December",
    memberIds: [ME_ID, "tm_hana", "tm_diego", "tm_tariq"],
    unread: 3,
    pinned: true,
    muted: false,
    messages: thread("c_renewals", [
      ["tm_hana", 1, "09:30", "Morning all. 12 accounts renew before the end of November, 4 of them are on Scale."],
      ["tm_tariq", 1, "09:34", "Two of the Scale ones had failed payments this month: Basalt Energy and Harrow Insurance. Worth a call before renewal."],
      [ME_ID, 1, "09:41", "Hana, can you take Basalt? I'll call Harrow myself."],
      ["tm_hana", 1, "09:42", "On it."],
      ["tm_hana", 0, "10:05", "Kestrel Freight want to move all 40 seats to Scale with annual invoicing."],
      ["tm_diego", 0, "10:07", "That would make them our 6th largest account by MRR."],
      ["tm_tariq", 0, "10:15", "Annual invoicing is fine on our side. I can have a quote ready this afternoon."],
    ]),
  },
  {
    id: "c_soren",
    memberIds: [ME_ID, "tm_soren"],
    unread: 0,
    pinned: false,
    muted: false,
    messages: thread("c_soren", [
      ["tm_soren", 2, "17:12", "Incident review for the webhook delays is up in the wiki."],
      [ME_ID, 2, "17:30", "Thanks. Did any customer notice before we did?"],
      ["tm_soren", 2, "17:33", "Two support tickets, both from Juniper Payments. Tariq replied to both within the hour."],
      [ME_ID, 2, "17:35", "Good. Let's add the queue age alert to the on-call runbook too."],
      ["tm_soren", 0, "09:02", "Runbook updated, and the alert fired correctly in this morning's test."],
    ]),
  },
  {
    id: "c_priya",
    memberIds: [ME_ID, "tm_priya"],
    unread: 0,
    pinned: false,
    muted: false,
    messages: thread("c_priya", [
      ["tm_priya", 1, "14:06", "Sent you the seat banner directions by email. B is my pick."],
      [ME_ID, 1, "14:40", "B reads much calmer. Does the 90% email go to every admin or only the owner?"],
      ["tm_priya", 1, "14:44", "Only the owner for now. Admins see the inline notice."],
      [ME_ID, 1, "14:45", "Works for me. Let's ship B."],
    ]),
  },
  {
    id: "c_billing",
    name: "Billing ops",
    topic: "Failed payments, refunds and invoices",
    memberIds: [ME_ID, "tm_tariq", "tm_freya"],
    unread: 0,
    pinned: false,
    muted: true,
    messages: thread("c_billing", [
      ["tm_tariq", 0, "08:30", "Overnight retries: 31 of 44 failed payments recovered, $4,120 of MRR."],
      ["tm_freya", 0, "08:41", "Nice. I'll add a recovered revenue line to the weekly report."],
      ["tm_tariq", 0, "08:44", "The other 13 are mostly expired cards, reminders go out at 14:00."],
    ]),
  },
  {
    id: "c_freya",
    memberIds: [ME_ID, "tm_freya"],
    unread: 0,
    pinned: false,
    muted: false,
    messages: thread("c_freya", [
      ["tm_freya", 1, "10:38", "October cohort retention: 91.4% after month one, up 3.2 points."],
      [ME_ID, 1, "10:52", "That's the onboarding checklist paying off. Can you split it by plan?"],
      ["tm_freya", 1, "11:20", "Starter 87.9%, Growth 92.6%, Scale 96.1%. Added to the analytics page."],
    ]),
  },
  {
    id: "c_emeka",
    memberIds: [ME_ID, "tm_emeka"],
    unread: 0,
    pinned: false,
    muted: false,
    messages: thread("c_emeka", [
      ["tm_emeka", 4, "15:40", "Tooltip contrast fix is live in dark mode."],
      [ME_ID, 4, "15:58", "Looks great, thank you!"],
    ]),
  },
]

/** Canned replies for the demo, so a sent message gets an answer. */
export const AUTO_REPLIES = [
  "Sounds good, I'll take care of it.",
  "Thanks, I'll get back to you by end of day.",
  "Makes sense. Want me to add it to the weekly review?",
  "On it.",
]
