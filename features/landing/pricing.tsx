"use client"

import { CheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TRIAL_DAYS } from "@/data/generate"
import { isDemo } from "@/features/demo/config"
import { billingNote, dollars, planCards, type Billing } from "@/features/pricing/plans"
import { cn } from "@/lib/utils"

/** Chronicle's plans, from the same source as the in-app Pricing page (features/pricing/plans.ts). */
export function Pricing() {
  const [billing, setBilling] = useState<Billing>("yearly")
  const cards = planCards(billing)

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-16 bg-muted/50 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <p className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">Pricing</p>
          <h2 id="pricing-title" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">Choose your plan</h2>
          <p className="text-lg text-pretty text-muted-foreground">{`${TRIAL_DAYS}-day free trial on every plan. Each plan includes seats; add more as your team grows.`}</p>
          <ToggleGroup
            aria-label="Billing period"
            value={[billing]}
            onValueChange={(value) => value[0] && setBilling(value[0] as Billing)}
            variant="outline"
            spacing={0}
            className="mt-4"
          >
            <ToggleGroupItem value="monthly" className="px-4">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="px-4">
              Yearly
              <span className="text-xs text-primary">2 months free</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <ul className="mx-auto mt-16 grid max-w-6xl items-center gap-6 lg:grid-cols-3">
          {cards.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-(--surface-shadow) sm:p-8",
                plan.featured && "border-primary/40 shadow-(--surface-shadow-raised) ring-1 ring-primary/30 lg:py-12"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  {plan.featured && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Most popular</span>}
                </div>
                <p className="text-sm text-pretty text-muted-foreground">{plan.description}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-baseline gap-1">
                  <span className="num text-4xl font-semibold tracking-tight">{dollars(plan.perMonthCents)}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </p>
                <span className="text-sm text-muted-foreground">{billingNote(plan, billing)}</span>
              </div>
              {plan.cta.href.startsWith("mailto:") ? (
                <a href={plan.cta.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}>
                  {plan.cta.label}
                </a>
              ) : (
                <Link href={plan.cta.href} className={cn(buttonVariants({ variant: plan.featured ? "default" : "outline", size: "lg" }), "h-10")}>
                  {plan.cta.label}
                </Link>
              )}
              <ul className="flex flex-col gap-3 border-t pt-6 text-sm">
                {plan.highlights.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {/* The public demo only: the template itself is free; these are the sample product's prices. */}
        {isDemo && <p className="mt-8 text-center text-xs text-muted-foreground">Example pricing for the product in this template.</p>}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Questions about seats, trials or invoices?{" "}
          <a href="#faq" className="font-medium text-primary underline-offset-4 hover:underline">
            Read the FAQ
          </a>
        </p>
      </div>
    </section>
  )
}
