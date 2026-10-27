import { DATA_NOW } from "@/lib/clock"

import { ACCOUNT_PREFIXES, ACCOUNT_SUFFIXES, FIRST_NAMES, INDUSTRIES, LAST_NAMES, TASK_TITLES, TEAM } from "./names"
import { Random } from "./random"
import type {
  Account,
  Activity,
  MrrMonth,
  Plan,
  PlanId,
  Region,
  Task,
  TaskLabel,
  TaskPriority,
  TaskStatus,
  TeamMember,
  User,
  UserRole,
  UserStatus,
} from "./schema"

export const PLANS: Record<PlanId, Plan> = {
  starter: { id: "starter", name: "Starter", baseCents: 9_900, includedSeats: 3, seatCents: 1_500 },
  growth: { id: "growth", name: "Growth", baseCents: 39_900, includedSeats: 10, seatCents: 2_500 },
  scale: { id: "scale", name: "Scale", baseCents: 149_000, includedSeats: 40, seatCents: 2_900 },
}

export const PLAN_IDS: PlanId[] = ["starter", "growth", "scale"]

/** What an account on `plan` with `seatLimit` paid seats pays each month. */
export function priceCents(plan: PlanId, seatLimit: number): number {
  const { baseCents, includedSeats, seatCents } = PLANS[plan]
  return baseCents + Math.max(0, seatLimit - includedSeats) * seatCents
}

/** Months of history the workspace has, ending with the month of DATA_NOW. */
export const HISTORY_MONTHS = 24

/** New accounts in the last 14 days are still on a free trial and pay nothing yet. */
export const TRIAL_DAYS = 14

const DAY = 86_400_000
const REGIONS: Region[] = ["North America", "Europe", "Asia Pacific", "Latin America"]

export interface Workspace {
  plans: Record<PlanId, Plan>
  team: TeamMember[]
  accounts: Account[]
  users: User[]
  tasks: Task[]
  mrr: MrrMonth[]
  activity: Activity[]
  /** Users created per UTC day for the last 90 days, oldest first. */
  signupsByDay: { day: string; users: number; accounts: number }[]
}

/** "2026-10" for a Date, in UTC. */
export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7)
}

function monthStart(now: Date, monthsBack: number): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1))
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

interface LedgerEntry {
  at: Date
  accountId: string
  kind: "new" | "expansion" | "contraction" | "churn"
  deltaCents: number
}

/**
 * Builds the whole sample workspace from one seed and DATA_NOW. Pure: the
 * same inputs give the same workspace, so every visit, screenshot and test
 * sees the same numbers.
 */
export function generateWorkspace(seed = 20261020, now: Date = DATA_NOW): Workspace {
  const random = new Random(seed)
  const nowMs = now.getTime()

  /** A moment in [from, to), at a whole minute. */
  const between = (from: number, to: number) => new Date(Math.floor((from + random.next() * Math.max(0, to - from)) / 60_000) * 60_000)

  const accounts: Account[] = []
  const ledger: LedgerEntry[] = []
  const usedNames = new Set<string>()

  for (let monthsBack = HISTORY_MONTHS - 1; monthsBack >= 0; monthsBack--) {
    const start = monthStart(now, monthsBack)
    const end = Math.min(monthStart(now, monthsBack - 1).getTime(), nowMs)
    const index = HISTORY_MONTHS - 1 - monthsBack
    const count = 7 + Math.round(index * 0.85) + random.int(-2, 2)

    for (let n = 0; n < count; n++) {
      let name = ""
      do {
        name = `${random.pick(ACCOUNT_PREFIXES)} ${random.pick(ACCOUNT_SUFFIXES)}`
      } while (usedNames.has(name))
      usedNames.add(name)

      const plan = PLAN_IDS[random.distribution([0.5, 0.36, 0.14])]
      const startedAt = between(start.getTime(), end)
      const trialing = nowMs - startedAt.getTime() < TRIAL_DAYS * DAY
      const seatLimit = PLANS[plan].includedSeats + (random.chance(0.45) ? random.int(1, plan === "scale" ? 30 : plan === "growth" ? 8 : 4) : 0)
      const id = `acc_${String(accounts.length + 1).padStart(4, "0")}`

      accounts.push({
        id,
        name,
        domain: `${slug(name)}.example.com`,
        industry: random.pick(INDUSTRIES),
        region: REGIONS[random.distribution([0.46, 0.3, 0.16, 0.08])],
        plan,
        status: trialing ? "trialing" : "active",
        seatLimit,
        seats: 0,
        mrrCents: trialing ? 0 : priceCents(plan, seatLimit),
        startedAt: startedAt.toISOString(),
        churnedAt: null,
        ownerId: random.pick(TEAM).id,
      })
      if (!trialing) {
        ledger.push({ at: startedAt, accountId: id, kind: "new", deltaCents: priceCents(plan, seatLimit) })
      }
    }
  }

  // Month by month after each start: churn, expansion, contraction.
  for (const account of accounts) {
    if (account.status === "trialing") {
      continue
    }
    const started = new Date(account.startedAt)
    for (let monthsBack = HISTORY_MONTHS - 1; monthsBack >= 0; monthsBack--) {
      const start = monthStart(now, monthsBack)
      if (start.getTime() <= started.getTime()) {
        continue
      }
      const end = Math.min(monthStart(now, monthsBack - 1).getTime(), nowMs)
      const churnChance = account.plan === "scale" ? 0.006 : account.plan === "growth" ? 0.012 : 0.02
      if (random.chance(churnChance)) {
        const at = between(start.getTime(), end)
        ledger.push({ at, accountId: account.id, kind: "churn", deltaCents: -account.mrrCents })
        account.status = "churned"
        account.churnedAt = at.toISOString()
        account.mrrCents = 0
        break
      }
      if (random.chance(0.045)) {
        const before = account.mrrCents
        account.seatLimit += random.int(1, account.plan === "scale" ? 12 : 4)
        account.mrrCents = priceCents(account.plan, account.seatLimit)
        ledger.push({ at: between(start.getTime(), end), accountId: account.id, kind: "expansion", deltaCents: account.mrrCents - before })
      } else if (account.seatLimit > PLANS[account.plan].includedSeats && random.chance(0.012)) {
        const before = account.mrrCents
        account.seatLimit -= 1
        account.mrrCents = priceCents(account.plan, account.seatLimit)
        ledger.push({ at: between(start.getTime(), end), accountId: account.id, kind: "contraction", deltaCents: account.mrrCents - before })
      }
    }
  }

  // A few paying accounts have a failed card this week. They still count in MRR until they churn.
  const paying = accounts.filter((account) => account.status === "active")
  for (const account of paying) {
    if (random.chance(0.035)) {
      account.status = "past_due"
    }
  }

  // MRR by month from the ledger.
  const mrr: MrrMonth[] = []
  let running = 0
  for (let monthsBack = HISTORY_MONTHS - 1; monthsBack >= 0; monthsBack--) {
    const key = monthKey(monthStart(now, monthsBack))
    const entries = ledger.filter((entry) => monthKey(entry.at) === key)
    const sum = (kind: LedgerEntry["kind"]) => entries.filter((entry) => entry.kind === kind).reduce((total, entry) => total + entry.deltaCents, 0)
    const month: MrrMonth = {
      month: key,
      newCents: sum("new"),
      expansionCents: sum("expansion"),
      contractionCents: -sum("contraction"),
      churnCents: -sum("churn"),
      mrrCents: 0,
      accounts: 0,
    }
    running += month.newCents + month.expansionCents - month.contractionCents - month.churnCents
    month.mrrCents = running
    const monthEnd = monthStart(now, monthsBack - 1).getTime()
    month.accounts = accounts.filter((account) => {
      const started = new Date(account.startedAt).getTime()
      const paid = account.status !== "trialing" && started < monthEnd
      return paid && (!account.churnedAt || new Date(account.churnedAt).getTime() >= monthEnd)
    }).length
    mrr.push(month)
  }

  // Users: everyone at accounts that have not churned.
  const users: User[] = []
  const usedEmails = new Set<string>()
  const ROLES: UserRole[] = ["admin", "member", "viewer"]
  for (const account of accounts) {
    if (account.status === "churned") {
      continue
    }
    const overLimit = account.status !== "trialing" && random.chance(0.07)
    const active =
      account.status === "trialing"
        ? random.int(1, 4)
        : overLimit
          ? account.seatLimit + random.int(1, 3)
          : Math.max(1, Math.min(account.seatLimit, Math.round(account.seatLimit * (0.55 + random.next() * 0.45))))
    const invited = random.chance(0.4) ? random.int(1, 3) : 0
    const suspended = random.chance(0.12) ? 1 : 0
    const startedMs = new Date(account.startedAt).getTime()

    const statuses: UserStatus[] = [...Array<UserStatus>(active).fill("active"), ...Array<UserStatus>(invited).fill("invited"), ...Array<UserStatus>(suspended).fill("suspended")]
    statuses.forEach((status, position) => {
      let first = ""
      let last = ""
      let email = ""
      do {
        first = random.pick(FIRST_NAMES)
        last = random.pick(LAST_NAMES)
        email = `${slug(first)}.${slug(last)}@${account.domain}`
      } while (usedEmails.has(email))
      usedEmails.add(email)
      const createdAt = position === 0 ? new Date(startedMs) : between(startedMs, nowMs - 30 * 60_000)
      const role: UserRole = position === 0 ? "owner" : ROLES[random.distribution([0.16, 0.66, 0.18])]
      users.push({
        id: `usr_${String(users.length + 1).padStart(5, "0")}`,
        name: `${first} ${last}`,
        email,
        role,
        status,
        accountId: account.id,
        accountName: account.name,
        plan: account.plan,
        createdAt: createdAt.toISOString(),
        lastSeenAt:
          status === "invited"
            ? null
            : status === "suspended"
              ? between(Math.max(createdAt.getTime(), nowMs - 120 * DAY), nowMs - 30 * DAY).toISOString()
              : between(Math.max(createdAt.getTime(), nowMs - (random.chance(0.8) ? 3 : 25) * DAY), nowMs).toISOString(),
      })
    })
    account.seats = active
  }

  // Activity: the most recent movements, newest first.
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const activity: Activity[] = []
  for (const entry of [...ledger].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 40)) {
    const account = accountById.get(entry.accountId)!
    const plan = PLANS[account.plan].name
    const kind = entry.kind === "new" ? "signup" : entry.kind === "expansion" ? "upgrade" : entry.kind === "contraction" ? "downgrade" : "churn"
    const detail =
      kind === "signup" ? `Started paying on ${plan}` : kind === "upgrade" ? `Added seats on ${plan}` : kind === "downgrade" ? `Removed a seat on ${plan}` : `Cancelled ${plan}`
    activity.push({ id: `act_${activity.length + 1}`, kind, accountId: account.id, accountName: account.name, at: entry.at.toISOString(), mrrDeltaCents: entry.deltaCents, detail })
  }
  for (const account of accounts.filter((candidate) => candidate.status === "past_due")) {
    const at = between(nowMs - 6 * DAY, nowMs - DAY / 4)
    activity.push({ id: `act_${activity.length + 1}`, kind: "payment_failed", accountId: account.id, accountName: account.name, at: at.toISOString(), mrrDeltaCents: 0, detail: "Card declined, retry scheduled" })
  }
  activity.sort((a, b) => b.at.localeCompare(a.at))

  // Signups per day, last 90 days: count once per record, then read the days off.
  const usersPerDay = new Map<string, number>()
  const accountsPerDay = new Map<string, number>()
  for (const user of users) usersPerDay.set(user.createdAt.slice(0, 10), (usersPerDay.get(user.createdAt.slice(0, 10)) ?? 0) + 1)
  for (const account of accounts) accountsPerDay.set(account.startedAt.slice(0, 10), (accountsPerDay.get(account.startedAt.slice(0, 10)) ?? 0) + 1)
  const signupsByDay: Workspace["signupsByDay"] = []
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  for (let back = 89; back >= 0; back--) {
    const day = new Date(today - back * DAY).toISOString().slice(0, 10)
    signupsByDay.push({ day, users: usersPerDay.get(day) ?? 0, accounts: accountsPerDay.get(day) ?? 0 })
  }

  // Tasks: Tidewell's own product backlog.
  const STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"]
  const PRIORITIES: TaskPriority[] = ["urgent", "high", "medium", "low"]
  const LABELS: TaskLabel[] = ["bug", "feature", "improvement", "docs", "chore"]
  const ranks: Record<TaskStatus, number> = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 }
  const tasks: Task[] = TASK_TITLES.map(([title, label], index) => {
    const status = STATUSES[random.distribution([0.22, 0.24, 0.2, 0.12, 0.22])]
    const createdAt = between(nowMs - 60 * DAY, nowMs - 2 * DAY)
    const due = status === "done" || random.chance(0.25) ? null : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + random.int(-4, 21))).toISOString().slice(0, 10)
    ranks[status] += 1
    return {
      id: `tsk_${String(index + 1).padStart(3, "0")}`,
      key: `TW-${140 + index}`,
      title,
      status,
      priority: PRIORITIES[random.distribution([0.1, 0.28, 0.4, 0.22])],
      label: label ?? LABELS[random.int(0, LABELS.length - 1)],
      assigneeId: random.chance(0.88) ? random.pick(TEAM).id : null,
      due,
      createdAt: createdAt.toISOString(),
      rank: ranks[status],
    }
  })

  return { plans: PLANS, team: TEAM, accounts, users, tasks, mrr, activity, signupsByDay }
}

let cached: Workspace | null = null

/** The sample workspace, built once per page load. */
export function workspace(): Workspace {
  cached ??= generateWorkspace()
  return cached
}

let contacts: Map<string, User[]> | null = null

/**
 * The people you would email about a customer account: its owner first, then
 * its active admins. Empty for a churned account, which has no users left.
 */
export function accountContacts(accountId: string): User[] {
  if (!contacts) {
    contacts = new Map()
    for (const user of workspace().users) {
      if (user.role === "owner" || (user.role === "admin" && user.status === "active")) {
        const list = contacts.get(user.accountId) ?? []
        list.push(user)
        contacts.set(user.accountId, list)
      }
    }
    for (const list of contacts.values()) {
      list.sort((a, b) => Number(b.role === "owner") - Number(a.role === "owner"))
    }
  }
  return contacts.get(accountId) ?? []
}

/** The customer's owner: the main contact for the account. */
export function accountContact(accountId: string): User | undefined {
  return accountContacts(accountId)[0]
}
