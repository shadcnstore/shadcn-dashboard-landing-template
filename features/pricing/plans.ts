import { PLAN_IDS, PLANS } from "@/data/generate"
import type { PlanId } from "@/data/schema"

/**
 * Chronicle's price list, one source for the in-app Pricing page and the
 * landing page's pricing section. Prices and seats come from PLANS in
 * data/generate.ts, the same plans every MRR figure in the app is built on,
 * so a price on a marketing page can never disagree with the dashboard.
 */

export type Billing = "monthly" | "yearly"

/** Yearly billing: twelve months for the price of ten. */
export const YEARLY_MONTHS_PAID = 10

export interface PlanCard {
  id: PlanId
  name: string
  description: string
  /** What the base plan costs per month on the chosen billing, in cents. */
  perMonthCents: number
  /** What a year costs on yearly billing, in cents. */
  yearCents: number
  includedSeats: number
  seatCents: number
  cta: { label: string; href: string }
  highlights: string[]
  featured: boolean
}

const COPY: Record<PlanId, { description: string; cta: { label: string; href: string }; highlights: string[]; featured?: boolean }> = {
  starter: {
    description: "For a young subscription business that wants its numbers in one place.",
    cta: { label: "Start a free trial", href: "/sign-up" },
    highlights: ["MRR, churn and signups dashboards", "Users, tasks and a shared inbox", "One billing connection", "12 months of history"],
  },
  growth: {
    description: "For teams that report revenue every month and chase failed payments.",
    cta: { label: "Start a free trial", href: "/sign-up" },
    featured: true,
    highlights: ["Everything in Starter", "Cohorts and retention by plan and region", "Failed-payment and seat alerts", "Unlimited history and CSV exports"],
  },
  scale: {
    description: "For finance and success teams with many accounts and strict access rules.",
    cta: { label: "Talk to sales", href: "mailto:sales@example.com" },
    highlights: ["Everything in Growth", "Single sign-on and an audit log", "Warehouse sync and webhooks", "A named customer success manager"],
  },
}

export function planCards(billing: Billing): PlanCard[] {
  return PLAN_IDS.map((id) => {
    const plan = PLANS[id]
    return {
      id,
      name: plan.name,
      description: COPY[id].description,
      perMonthCents: billing === "yearly" ? Math.round((plan.baseCents * YEARLY_MONTHS_PAID) / 12) : plan.baseCents,
      yearCents: plan.baseCents * YEARLY_MONTHS_PAID,
      includedSeats: plan.includedSeats,
      seatCents: plan.seatCents,
      cta: COPY[id].cta,
      highlights: COPY[id].highlights,
      featured: Boolean(COPY[id].featured),
    }
  })
}

/** "$1,490": whole dollars, for prices. */
export function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

/** The line under a price: how it is billed and what the seats cost. */
export function billingNote(card: PlanCard, billing: Billing): string {
  const period = billing === "yearly" ? `${dollars(card.yearCents)} billed yearly.` : "Billed monthly."
  return `${period} Includes ${card.includedSeats} seats, then ${dollars(card.seatCents)} per seat a month.`
}
