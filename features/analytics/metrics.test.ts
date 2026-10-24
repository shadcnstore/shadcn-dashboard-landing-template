import { describe, expect, it } from "vitest"

import { generateWorkspace } from "@/data/generate"

import {
  analyticsMetrics,
  cohortRetention,
  payingAccounts,
  PERIODS,
  periodSummary,
  revenueByPlan,
  revenueByRegion,
  topAccounts,
} from "./metrics"
import { REPORTS_OPENED, USAGE_CELLS, WEEKLY_REPORTS } from "./usage"

const workspace = generateWorkspace()
const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0)
const mrrNow = workspace.mrr.at(-1)!.mrrCents

describe("Analytics breakdowns", () => {
  it("splits MRR by plan into parts that sum to MRR", () => {
    const plans = revenueByPlan(workspace.accounts)
    expect(sum(plans.map((row) => row.mrrCents))).toBe(mrrNow)
    expect(sum(plans.map((row) => row.accounts))).toBe(
      payingAccounts(workspace.accounts).length
    )
    expect(sum(plans.map((row) => row.share))).toBeCloseTo(1, 10)
  })

  it("splits MRR by region into parts that sum to MRR", () => {
    const regions = revenueByRegion(workspace.accounts)
    expect(sum(regions.map((row) => row.mrrCents))).toBe(mrrNow)
    expect(sum(regions.map((row) => row.accounts))).toBe(
      payingAccounts(workspace.accounts).length
    )
  })

  it.each(PERIODS)(
    "explains the change in MRR over %i months by its movement",
    (period) => {
      const summary = periodSummary(workspace.mrr, period)
      const {
        newCents,
        expansionCents,
        contractionCents,
        churnCents,
        netCents,
      } = summary.totals
      expect(summary.months).toHaveLength(period)
      expect(netCents).toBe(
        newCents + expansionCents - contractionCents - churnCents
      )
      expect(summary.endCents - summary.startCents).toBe(netCents)
      expect(summary.previous.endCents - summary.previous.startCents).toBe(
        summary.previous.totals.netCents
      )
      expect(summary.previous.endCents).toBe(summary.startCents)
    }
  )

  it("builds each cohort from the accounts that started paying that month", () => {
    const cohorts = cohortRetention(workspace.accounts, workspace.mrr, 12)
    expect(cohorts).toHaveLength(12)
    for (const cohort of cohorts) {
      const members = workspace.accounts.filter(
        (account) =>
          account.status !== "trialing" &&
          account.startedAt.startsWith(cohort.month)
      )
      expect(cohort.size).toBe(members.length)
      // Today's retention is exactly the share of the cohort that has not churned.
      const alive = members.filter(
        (account) => account.churnedAt === null
      ).length
      expect(cohort.retained.at(-1)).toBeCloseTo(
        members.length ? alive / members.length : 0,
        10
      )
      // Retention never goes back up.
      cohort.retained.forEach(
        (value, index) =>
          index > 0 &&
          expect(value).toBeLessThanOrEqual(cohort.retained[index - 1])
      )
    }
    // The oldest cohort has a value for every month since, the newest one just one.
    expect(cohorts[0].retained).toHaveLength(12)
    expect(cohorts.at(-1)!.retained).toHaveLength(1)
  })

  it("ranks top accounts by MRR, each share against the total", () => {
    const top = topAccounts(workspace.accounts, 8)
    expect(top).toHaveLength(8)
    top.forEach((account, index) => {
      expect(account.share).toBeCloseTo(account.mrrCents / mrrNow, 10)
      if (index > 0) {
        expect(account.mrrCents).toBeLessThanOrEqual(top[index - 1].mrrCents)
      }
    })
  })

  it("is the same for every call", () => {
    expect(analyticsMetrics(workspace, 6)).toEqual(
      analyticsMetrics(generateWorkspace(), 6)
    )
  })
})

describe("Product usage punch card", () => {
  it("has one fixed value for every weekday and hour", () => {
    expect(REPORTS_OPENED).toHaveLength(7)
    REPORTS_OPENED.forEach((row) => expect(row).toHaveLength(24))
    expect(USAGE_CELLS).toHaveLength(168)
    expect(WEEKLY_REPORTS).toBe(sum(REPORTS_OPENED.flat()))
  })
})
