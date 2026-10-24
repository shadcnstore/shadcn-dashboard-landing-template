import { PLAN_IDS, PLANS, type Workspace } from "@/data/generate"
import type { PlanId } from "@/data/schema"

const DAY = 86_400_000
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

/** "Oct" for "2026-10". */
export function monthLabel(month: string, withYear = false): string {
  const date = new Date(`${month}-01T00:00:00Z`)
  return date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC", ...(withYear ? { year: "numeric" } : {}) })
}

export interface PlanRow {
  plan: PlanId
  name: string
  accounts: number
  mrrCents: number
  /** Average revenue per paying account. */
  arpaCents: number
  share: number
}

export interface OverviewMetrics {
  mrr: { now: number; lastMonth: number; yearAgo: number; month: string; lastMonthKey: string; yearAgoKey: string }
  /** The last 12 months, oldest first. */
  history: { month: string; mrrCents: number }[]
  movement: { newCents: number; expansionCents: number; contractionCents: number; churnCents: number }
  plans: PlanRow[]
  accounts: { paying: number; lastMonth: number; history: { month: string; accounts: number }[] }
  /** Last full month: (start + expansion - contraction - churn) / start. */
  retention: { month: string; net: number; gross: number; previousNet: number }
  trials: { open: number; weekly: { label: string; value: number }[]; thisWeek: number; lastWeek: number }
  users: { active: number; newLast7: number; newPrior7: number; daily: { day: string; users: number }[] }
}

function retentionFor(workspace: Workspace, index: number) {
  const start = workspace.mrr[index - 1].mrrCents
  const month = workspace.mrr[index]
  return {
    net: (start + month.expansionCents - month.contractionCents - month.churnCents) / start,
    gross: (start - month.contractionCents - month.churnCents) / start,
  }
}

/** Every figure on the Overview, computed from the workspace. Pure, so tests can check that the parts add up. */
export function overviewMetrics(workspace: Workspace, now: Date): OverviewMetrics {
  const months = workspace.mrr
  const current = months.at(-1)!
  const last = months.at(-2)!
  const yearAgo = months.at(-13)!
  const paying = workspace.accounts.filter((account) => account.status === "active" || account.status === "past_due")

  const plans = PLAN_IDS.map((plan) => {
    const rows = paying.filter((account) => account.plan === plan)
    const mrrCents = sum(rows.map((account) => account.mrrCents))
    return { plan, name: PLANS[plan].name, accounts: rows.length, mrrCents, arpaCents: rows.length ? Math.round(mrrCents / rows.length) : 0, share: mrrCents / current.mrrCents }
  })

  const lastFull = months.length - 2
  const thisRetention = retentionFor(workspace, lastFull)
  const previousRetention = retentionFor(workspace, lastFull - 1)

  // Trials: new accounts per week for the last 12 weeks (week 12 ends today).
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + DAY
  const weekly = Array.from({ length: 12 }, (_, index) => {
    const end = today - (11 - index) * 7 * DAY
    const start = end - 7 * DAY
    const value = workspace.accounts.filter((account) => {
      const at = new Date(account.startedAt).getTime()
      return at >= start && at < end
    }).length
    const label = new Date(start).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" })
    return { label, value }
  })

  const daily = workspace.signupsByDay.slice(-30).map(({ day, users }) => ({ day, users }))
  const last14 = workspace.signupsByDay.slice(-14)

  return {
    mrr: { now: current.mrrCents, lastMonth: last.mrrCents, yearAgo: yearAgo.mrrCents, month: current.month, lastMonthKey: last.month, yearAgoKey: yearAgo.month },
    history: months.slice(-12).map(({ month, mrrCents }) => ({ month, mrrCents })),
    movement: { newCents: current.newCents, expansionCents: current.expansionCents, contractionCents: current.contractionCents, churnCents: current.churnCents },
    plans,
    accounts: { paying: paying.length, lastMonth: last.accounts, history: months.slice(-12).map(({ month, accounts }) => ({ month, accounts })) },
    retention: { month: months[lastFull].month, net: thisRetention.net, gross: thisRetention.gross, previousNet: previousRetention.net },
    trials: { open: workspace.accounts.filter((account) => account.status === "trialing").length, weekly, thisWeek: weekly[11].value, lastWeek: weekly[10].value },
    users: {
      active: workspace.users.filter((user) => user.status === "active").length,
      newLast7: sum(last14.slice(7).map((day) => day.users)),
      newPrior7: sum(last14.slice(0, 7).map((day) => day.users)),
      daily,
    },
  }
}
