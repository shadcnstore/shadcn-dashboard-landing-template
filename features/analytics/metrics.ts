import { PLAN_IDS, PLANS, type Workspace } from "@/data/generate"
import type { Account, MrrMonth, PlanId, Region } from "@/data/schema"

/**
 * Every figure on the Analytics page, computed from the workspace. Pure, so
 * features/analytics/metrics.test.ts can prove each breakdown adds up to the
 * total it explains.
 */

export const PERIODS = [3, 6, 12] as const
export type Period = (typeof PERIODS)[number]

export const REGIONS: Region[] = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
]

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0)

/** Accounts that pay right now. A failed card still counts until the account churns. */
export function payingAccounts(accounts: Account[]): Account[] {
  return accounts.filter(
    (account) => account.status === "active" || account.status === "past_due"
  )
}

/** "Oct" or "Oct 2026" for "2026-10". */
export function monthLabel(month: string, withYear = false): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
    ...(withYear ? { year: "numeric" } : {}),
  })
}

export interface MovementTotals {
  newCents: number
  expansionCents: number
  contractionCents: number
  churnCents: number
  /** new + expansion - contraction - churn. */
  netCents: number
}

export interface PeriodSummary {
  months: MrrMonth[]
  /** MRR at the end of the month before the period. */
  startCents: number
  /** MRR now. */
  endCents: number
  totals: MovementTotals
  /** The same figures for the period of equal length before this one. */
  previous: { startCents: number; endCents: number; totals: MovementTotals }
}

function totalsOf(months: MrrMonth[]): MovementTotals {
  const newCents = sum(months.map((month) => month.newCents))
  const expansionCents = sum(months.map((month) => month.expansionCents))
  const contractionCents = sum(months.map((month) => month.contractionCents))
  const churnCents = sum(months.map((month) => month.churnCents))
  return {
    newCents,
    expansionCents,
    contractionCents,
    churnCents,
    netCents: newCents + expansionCents - contractionCents - churnCents,
  }
}

/** The last `period` months of MRR movement and the period before, for the deltas. */
export function periodSummary(mrr: MrrMonth[], period: Period): PeriodSummary {
  const months = mrr.slice(-period)
  const before = mrr.slice(-period * 2, -period)
  const startOf = (index: number) => (index > 0 ? mrr[index - 1].mrrCents : 0)
  const startIndex = mrr.length - period
  const previousStartIndex = Math.max(0, mrr.length - period * 2)
  return {
    months,
    startCents: startOf(startIndex),
    endCents: mrr.at(-1)?.mrrCents ?? 0,
    totals: totalsOf(months),
    previous: {
      startCents: startOf(previousStartIndex),
      endCents: startOf(startIndex),
      totals: totalsOf(before),
    },
  }
}

export interface MixRow<K extends string> {
  key: K
  label: string
  accounts: number
  mrrCents: number
  /** Share of total MRR, 0 to 1. */
  share: number
}

function mix<K extends string>(
  paying: Account[],
  keys: readonly K[],
  label: (key: K) => string,
  pick: (account: Account) => K
): MixRow<K>[] {
  const total = sum(paying.map((account) => account.mrrCents))
  return keys.map((key) => {
    const rows = paying.filter((account) => pick(account) === key)
    const mrrCents = sum(rows.map((account) => account.mrrCents))
    return {
      key,
      label: label(key),
      accounts: rows.length,
      mrrCents,
      share: total ? mrrCents / total : 0,
    }
  })
}

/** Current MRR split by plan. The rows sum to the latest month's MRR. */
export function revenueByPlan(accounts: Account[]): MixRow<PlanId>[] {
  return mix(
    payingAccounts(accounts),
    PLAN_IDS,
    (plan) => PLANS[plan].name,
    (account) => account.plan
  )
}

/** Current MRR split by region. The rows sum to the latest month's MRR. */
export function revenueByRegion(accounts: Account[]): MixRow<Region>[] {
  return mix(
    payingAccounts(accounts),
    REGIONS,
    (region) => region,
    (account) => account.region
  )
}

export interface Cohort {
  /** "2026-04" */
  month: string
  /** Accounts that started paying that month. */
  size: number
  /**
   * Share still paying at the end of each month since, starting with the
   * signup month itself. The current month counts as an end, so the last
   * value is "still paying today".
   */
  retained: number[]
}

/**
 * Logo retention by signup month, from each account's startedAt and churnedAt.
 * Accounts still on a trial have not paid yet, so they are left out.
 */
export function cohortRetention(
  accounts: Account[],
  mrr: MrrMonth[],
  count = 12
): Cohort[] {
  const keys = mrr.map((month) => month.month)
  const ends = keys.map((key) => {
    const [year, month] = key.split("-").map(Number)
    return Date.UTC(year, month, 1)
  })
  const paid = accounts.filter((account) => account.status !== "trialing")
  return keys.slice(-count).map((key) => {
    const index = keys.indexOf(key)
    const members = paid.filter(
      (account) => account.startedAt.slice(0, 7) === key
    )
    const retained: number[] = []
    for (let end = index; end < keys.length; end++) {
      const alive = members.filter(
        (account) =>
          account.churnedAt === null ||
          new Date(account.churnedAt).getTime() >= ends[end]
      ).length
      retained.push(members.length ? alive / members.length : 0)
    }
    return { month: key, size: members.length, retained }
  })
}

/** The largest paying accounts by MRR, with their share of the total. */
export function topAccounts(
  accounts: Account[],
  count = 8
): (Account & { share: number })[] {
  const paying = payingAccounts(accounts)
  const total = sum(paying.map((account) => account.mrrCents))
  return [...paying]
    .sort((a, b) => b.mrrCents - a.mrrCents)
    .slice(0, count)
    .map((account) => ({
      ...account,
      share: total ? account.mrrCents / total : 0,
    }))
}

export interface AnalyticsMetrics {
  period: PeriodSummary
  plans: MixRow<PlanId>[]
  regions: MixRow<Region>[]
  cohorts: Cohort[]
  top: (Account & { share: number })[]
}

export function analyticsMetrics(
  workspace: Workspace,
  period: Period
): AnalyticsMetrics {
  return {
    period: periodSummary(workspace.mrr, period),
    plans: revenueByPlan(workspace.accounts),
    regions: revenueByRegion(workspace.accounts),
    cohorts: cohortRetention(workspace.accounts, workspace.mrr, 12),
    top: topAccounts(workspace.accounts, 8),
  }
}
