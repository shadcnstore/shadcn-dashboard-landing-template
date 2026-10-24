/**
 * Tidewell, the sample business: a subscription-analytics company with
 * customer accounts on three plans. Money is integer cents, dates are ISO
 * strings in UTC. Every total on screen is a sum of these records, and
 * data/generate.test.ts proves it.
 */

export type PlanId = "starter" | "growth" | "scale"

export interface Plan {
  id: PlanId
  name: string
  /** Monthly price including `includedSeats`. */
  baseCents: number
  includedSeats: number
  /** Monthly price of each seat bought beyond the included ones. */
  seatCents: number
}

export type AccountStatus = "active" | "trialing" | "past_due" | "churned"

export type Region = "North America" | "Europe" | "Asia Pacific" | "Latin America"

export interface Account {
  id: string
  name: string
  domain: string
  industry: string
  region: Region
  plan: PlanId
  status: AccountStatus
  /** Seats paid for. */
  seatLimit: number
  /** Active users right now; may exceed the limit. */
  seats: number
  /** Current monthly recurring revenue; 0 while trialing or after churn. */
  mrrCents: number
  startedAt: string
  churnedAt: string | null
  /** The team member who owns the relationship. */
  ownerId: string
}

export type UserRole = "owner" | "admin" | "member" | "viewer"
export type UserStatus = "active" | "invited" | "suspended"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  accountId: string
  accountName: string
  plan: PlanId
  createdAt: string
  /** Null until the user first signs in. */
  lastSeenAt: string | null
}

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done"
export type TaskPriority = "urgent" | "high" | "medium" | "low"
export type TaskLabel = "bug" | "feature" | "improvement" | "docs" | "chore"

export interface Task {
  id: string
  key: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  label: TaskLabel
  assigneeId: string | null
  due: string | null
  createdAt: string
  /** Order inside its status column. */
  rank: number
}

/** Someone on Tidewell's own team: account owners and task assignees. */
export interface TeamMember {
  id: string
  name: string
  email: string
  title: string
}

/** One month of MRR movement. mrr = previous mrr + new + expansion - contraction - churn. */
export interface MrrMonth {
  /** "2026-10" */
  month: string
  mrrCents: number
  newCents: number
  expansionCents: number
  contractionCents: number
  churnCents: number
  /** Paying accounts at the end of the month. */
  accounts: number
}

export type ActivityKind = "signup" | "upgrade" | "churn" | "payment_failed" | "invite" | "downgrade"

export interface Activity {
  id: string
  kind: ActivityKind
  accountId: string
  accountName: string
  at: string
  /** Change in MRR the event caused, in cents (0 when none). */
  mrrDeltaCents: number
  detail: string
}
