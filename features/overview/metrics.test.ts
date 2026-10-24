import { describe, expect, it } from "vitest"

import { generateWorkspace } from "@/data/generate"
import { DATA_NOW } from "@/lib/clock"

import { overviewMetrics } from "./metrics"

const workspace = generateWorkspace()
const metrics = overviewMetrics(workspace, DATA_NOW)
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

describe("Overview figures", () => {
  it("splits MRR by plan into rows that add up to the headline", () => {
    expect(sum(metrics.plans.map((row) => row.mrrCents))).toBe(metrics.mrr.now)
    expect(sum(metrics.plans.map((row) => row.accounts))).toBe(metrics.accounts.paying)
    expect(sum(metrics.plans.map((row) => row.share))).toBeCloseTo(1, 10)
  })

  it("ends the 12-month chart on the headline figure", () => {
    expect(metrics.history).toHaveLength(12)
    expect(metrics.history.at(-1)!.mrrCents).toBe(metrics.mrr.now)
  })

  it("explains this month's change by its movements", () => {
    const { newCents, expansionCents, contractionCents, churnCents } = metrics.movement
    expect(metrics.mrr.lastMonth + newCents + expansionCents - contractionCents - churnCents).toBe(metrics.mrr.now)
  })

  it("counts trials in the weeks they started", () => {
    const start = Date.UTC(2026, 9, 21) - 84 * 86_400_000
    const started = workspace.accounts.filter((account) => new Date(account.startedAt).getTime() >= start).length
    expect(sum(metrics.trials.weekly.map((week) => week.value))).toBe(started)
  })

  it("keeps retention between 0 and a believable ceiling", () => {
    expect(metrics.retention.gross).toBeLessThanOrEqual(metrics.retention.net)
    expect(metrics.retention.net).toBeGreaterThan(0.9)
    expect(metrics.retention.net).toBeLessThan(1.2)
  })
})
