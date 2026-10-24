import { describe, expect, it } from "vitest"

import { DATA_NOW } from "@/lib/clock"

import { generateWorkspace, PLAN_IDS, priceCents, TRIAL_DAYS } from "./generate"

const workspace = generateWorkspace()
const paying = workspace.accounts.filter((account) => account.status === "active" || account.status === "past_due")
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

describe("Tidewell sample workspace", () => {
  it("is the same on every run", () => {
    expect(generateWorkspace()).toEqual(workspace)
  })

  it("never dates anything after the demo's now", () => {
    const now = DATA_NOW.toISOString()
    for (const account of workspace.accounts) {
      expect(account.startedAt <= now).toBe(true)
      expect(account.churnedAt === null || account.churnedAt <= now).toBe(true)
    }
    for (const user of workspace.users) {
      expect(user.createdAt <= now).toBe(true)
      expect(user.lastSeenAt === null || user.lastSeenAt <= now).toBe(true)
    }
    expect(workspace.activity.every((entry) => entry.at <= now)).toBe(true)
  })

  it("ends the MRR series at the sum of paying accounts", () => {
    expect(workspace.mrr.at(-1)!.mrrCents).toBe(sum(paying.map((account) => account.mrrCents)))
    expect(workspace.mrr.at(-1)!.accounts).toBe(paying.length)
  })

  it("moves MRR month to month by exactly its movements", () => {
    let previous = 0
    for (const month of workspace.mrr) {
      expect(month.mrrCents).toBe(previous + month.newCents + month.expansionCents - month.contractionCents - month.churnCents)
      previous = month.mrrCents
    }
  })

  it("splits MRR by plan into parts that add up to the total", () => {
    const byPlan = PLAN_IDS.map((plan) => sum(paying.filter((account) => account.plan === plan).map((account) => account.mrrCents)))
    expect(sum(byPlan)).toBe(workspace.mrr.at(-1)!.mrrCents)
  })

  it("prices every paying account from its plan and seats", () => {
    for (const account of paying) {
      expect(account.mrrCents).toBe(priceCents(account.plan, account.seatLimit))
    }
    for (const account of workspace.accounts.filter((candidate) => candidate.status === "trialing" || candidate.status === "churned")) {
      expect(account.mrrCents).toBe(0)
    }
  })

  it("keeps trials inside the trial window", () => {
    for (const account of workspace.accounts.filter((candidate) => candidate.status === "trialing")) {
      expect(DATA_NOW.getTime() - new Date(account.startedAt).getTime()).toBeLessThan(TRIAL_DAYS * 86_400_000)
    }
  })

  it("counts an account's seats as its active users", () => {
    for (const account of workspace.accounts.filter((candidate) => candidate.status !== "churned")) {
      const active = workspace.users.filter((user) => user.accountId === account.id && user.status === "active").length
      expect(active).toBe(account.seats)
    }
  })

  it("gives every account exactly one owner, and churned accounts no users", () => {
    for (const account of workspace.accounts) {
      const owners = workspace.users.filter((user) => user.accountId === account.id && user.role === "owner").length
      expect(owners).toBe(account.status === "churned" ? 0 : 1)
    }
  })

  it("sums signups per day to the users and accounts created in those days", () => {
    const first = workspace.signupsByDay[0].day
    expect(sum(workspace.signupsByDay.map((day) => day.users))).toBe(workspace.users.filter((user) => user.createdAt.slice(0, 10) >= first).length)
    expect(sum(workspace.signupsByDay.map((day) => day.accounts))).toBe(workspace.accounts.filter((account) => account.startedAt.slice(0, 10) >= first).length)
  })

  it("uses only example.com addresses and unique ids", () => {
    expect(workspace.users.every((user) => /@[a-z0-9-]+\.example\.com$/.test(user.email))).toBe(true)
    expect(workspace.team.every((member) => member.email.endsWith("@example.com"))).toBe(true)
    expect(new Set(workspace.users.map((user) => user.id)).size).toBe(workspace.users.length)
    expect(new Set(workspace.users.map((user) => user.email)).size).toBe(workspace.users.length)
    expect(new Set(workspace.accounts.map((account) => account.name)).size).toBe(workspace.accounts.length)
  })
})
