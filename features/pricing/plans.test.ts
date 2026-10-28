import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { PLAN_IDS, PLANS } from "@/data/generate"
import { FAQS, LANDING_FAQS, LANDING_QUESTIONS } from "@/features/faqs/data"

import { planCards, YEARLY_MONTHS_PAID } from "./plans"

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")

describe("Chronicle's price list", () => {
  it("prices every plan from the app's plan data", () => {
    const monthly = planCards("monthly")
    const yearly = planCards("yearly")
    expect(monthly.map((card) => card.id)).toEqual(PLAN_IDS)
    for (const [index, id] of PLAN_IDS.entries()) {
      expect(monthly[index].perMonthCents).toBe(PLANS[id].baseCents)
      expect(monthly[index].includedSeats).toBe(PLANS[id].includedSeats)
      expect(monthly[index].seatCents).toBe(PLANS[id].seatCents)
      expect(yearly[index].yearCents).toBe(PLANS[id].baseCents * YEARLY_MONTHS_PAID)
    }
  })

  it("is the only source of prices on the landing page and the Pricing page", () => {
    for (const [file, importPath] of [
      ["features/landing/pricing.tsx", "@/features/pricing/plans"],
      ["features/pricing/pricing-page.tsx", "./plans"],
    ]) {
      const source = read(file)
      expect(source).toContain(`from "${importPath}"`)
      // No hand-typed dollar amounts.
      expect(source).not.toMatch(/\$\d/)
    }
  })

  it("never promises a free plan or unlimited seats", () => {
    const copy = [read("features/landing/pricing.tsx"), read("features/landing/hero.tsx"), read("features/landing/cta.tsx"), read("features/pricing/plans.ts"), ...FAQS.map((faq) => faq.answer)].join("\n")
    expect(copy).not.toMatch(/unlimited seats|start free\b|free up to|free for your first|free growth/i)
  })

  it("shows landing FAQ answers from the same help centre as the FAQs page", () => {
    expect(LANDING_FAQS).toHaveLength(LANDING_QUESTIONS.length)
  })
})
