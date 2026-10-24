"use client"

import { CheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Billing = "monthly" | "yearly"

const PLANS = [
  {
    name: "Starter",
    description: "For new subscription businesses finding their footing.",
    monthly: 0,
    yearly: 0,
    note: "Free up to $10k MRR",
    cta: { label: "Start free", href: "/sign-up" },
    features: ["MRR, churn and ARPA dashboards", "One billing connection", "12 months of history", "Community support"],
  },
  {
    name: "Growth",
    description: "For teams that report revenue to a board every month.",
    monthly: 49,
    yearly: 39,
    note: "per month, up to $250k MRR",
    cta: { label: "Start a 14-day trial", href: "/sign-up" },
    featured: true,
    includes: "Everything in Starter, plus",
    features: ["Cohorts by plan, region and channel", "Unlimited history", "Versioned metric definitions", "Spreadsheet exports", "Email support, one business day"],
  },
  {
    name: "Scale",
    description: "For finance teams with several entities and currencies.",
    monthly: 199,
    yearly: 159,
    note: "per month, any MRR",
    cta: { label: "Talk to us", href: "#contact" },
    includes: "Everything in Growth, plus",
    features: ["Multi-entity and multi-currency", "Single sign-on and audit log", "Warehouse sync", "A named analyst"],
  },
]

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("yearly")

  return (
    <section id="pricing" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="font-mono text-xs font-medium tracking-wider text-primary uppercase">Pricing</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Priced on what you track, not who looks</h2>
          <p className="text-base text-pretty text-muted-foreground sm:text-lg">Unlimited seats on every plan. Move up when your revenue does.</p>
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
              <span className="text-xs text-primary">-20%</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = billing === "yearly" ? plan.yearly : plan.monthly
            return (
              <li
                key={plan.name}
                className={cn(
                  "relative flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-(--surface-shadow) sm:p-8",
                  plan.featured && "border-primary/40 shadow-(--surface-shadow-raised) ring-1 ring-primary/30"
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
                  <span className="num text-4xl font-semibold tracking-tight">${price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.note}
                    {price > 0 && billing === "yearly" ? ", billed yearly" : ""}
                  </span>
                </div>
                {plan.cta.href.startsWith("#") ? (
                  <a href={plan.cta.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}>
                    {plan.cta.label}
                  </a>
                ) : (
                  <Link href={plan.cta.href} className={cn(buttonVariants({ variant: plan.featured ? "default" : "outline", size: "lg" }), "h-10")}>
                    {plan.cta.label}
                  </Link>
                )}
                <ul className="flex flex-col gap-3 border-t pt-6 text-sm">
                  {plan.includes && <li className="font-medium">{plan.includes}</li>}
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Running a nonprofit or an open-source project?{" "}
          <a href="#contact" className="font-medium text-primary underline-offset-4 hover:underline">
            Ask about free Growth
          </a>
        </p>
      </div>
    </section>
  )
}
