"use client"

import { CheckIcon, MinusIcon } from "lucide-react"
import Link from "next/link"
import { Fragment, useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PLAN_IDS, PLANS, TRIAL_DAYS } from "@/data/generate"
import type { PlanId } from "@/data/schema"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { cn } from "@/lib/utils"

import { billingNote, dollars, planCards, type Billing } from "./plans"

type Cell = boolean | string

/** The comparison table. `true` is a check, `false` a dash, a string is shown as written. */
const COMPARISON: { section: string; rows: { label: string; values: Record<PlanId, Cell> }[] }[] = [
  {
    section: "Revenue analytics",
    rows: [
      { label: "MRR, churn and signups", values: { starter: true, growth: true, scale: true } },
      { label: "MRR movement breakdown", values: { starter: true, growth: true, scale: true } },
      { label: "Cohort retention", values: { starter: false, growth: true, scale: true } },
      { label: "History", values: { starter: "12 months", growth: "Unlimited", scale: "Unlimited" } },
      { label: "CSV exports", values: { starter: false, growth: true, scale: true } },
    ],
  },
  {
    section: "Workspace",
    rows: [
      { label: "Users, roles and invites", values: { starter: true, growth: true, scale: true } },
      { label: "Tasks, mail, chat and calendar", values: { starter: true, growth: true, scale: true } },
      { label: "Failed-payment and seat alerts", values: { starter: false, growth: true, scale: true } },
      { label: "Billing connections", values: { starter: "1", growth: "3", scale: "Unlimited" } },
      { label: "Warehouse sync and webhooks", values: { starter: false, growth: false, scale: true } },
    ],
  },
  {
    section: "Security and support",
    rows: [
      { label: "Two-step sign-in", values: { starter: true, growth: true, scale: true } },
      { label: "Single sign-on", values: { starter: false, growth: false, scale: true } },
      { label: "Audit log", values: { starter: false, growth: false, scale: true } },
      { label: "Support", values: { starter: "Email", growth: "Email, one business day", scale: "Named success manager" } },
    ],
  },
]

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <CheckIcon className="size-4 text-primary" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <MinusIcon className="size-4 text-muted-foreground/60" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    )
  }
  return <span className="text-sm">{value}</span>
}

/**
 * An example pricing page for the product the dashboard runs: Chronicle's own
 * plans, read from data/generate.ts so the prices match every MRR figure in
 * the app. Replace PLANS and the copy here with yours.
 */
export function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly")

  return (
    <>
      <PageHeader
        title="Pricing"
        description={`Every plan starts with a ${TRIAL_DAYS}-day free trial. Pay for the seats you use, change plans any time.`}
        actions={
          <ToggleGroup aria-label="Billing period" value={[billing]} onValueChange={(value) => value[0] && setBilling(value[0] as Billing)} variant="outline" spacing={0}>
            <ToggleGroupItem value="monthly" className="px-4">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="px-4">
              Yearly
              <span className="text-xs text-primary">2 months free</span>
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />

      <ul className="grid gap-4 lg:grid-cols-3">
        {planCards(billing).map((card) => {
          const buttonClass = cn(buttonVariants({ variant: card.featured ? "default" : "outline", size: "lg" }), "h-10")
          return (
            <li
              key={card.id}
              className={cn("relative flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-(--surface-shadow)", card.featured && "border-primary/40 ring-1 ring-primary/30")}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold">{card.name}</h2>
                  {card.featured && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Most popular</span>}
                </div>
                <p className="text-sm text-pretty text-muted-foreground">{card.description}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">{dollars(card.perMonthCents)}</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </p>
                <p className="text-sm text-muted-foreground">{billingNote(card, billing)}</p>
              </div>
              {card.cta.href.startsWith("mailto:") ? (
                <a href={card.cta.href} className={buttonClass}>
                  {card.cta.label}
                </a>
              ) : (
                <Link href={card.cta.href} className={buttonClass}>
                  {card.cta.label}
                </Link>
              )}
              <ul className="flex flex-col gap-3 border-t pt-6 text-sm">
                {card.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      <section aria-labelledby="compare-plans" className="flex flex-col gap-4 rounded-2xl border bg-card py-6 shadow-(--surface-shadow)">
        <div className="flex flex-col gap-1 px-6">
          <h2 id="compare-plans" className="font-heading text-lg font-semibold">
            Compare plans
          </h2>
          <p className="text-sm text-muted-foreground">Everything each plan includes, side by side.</p>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5 ps-6">Feature</TableHead>
                {PLAN_IDS.map((id) => (
                  <TableHead key={id} className="text-center last:pe-6">
                    <span className="flex flex-col items-center gap-0.5 py-1">
                      <span className="font-semibold text-foreground">{PLANS[id].name}</span>
                      <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">{dollars(planCards(billing).find((card) => card.id === id)!.perMonthCents)} / mo</span>
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="ps-6">Seats included</TableCell>
                {PLAN_IDS.map((id) => (
                  <TableCell key={id} className="text-center font-mono tabular-nums last:pe-6">
                    {PLANS[id].includedSeats}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="ps-6">Each extra seat, a month</TableCell>
                {PLAN_IDS.map((id) => (
                  <TableCell key={id} className="text-center font-mono tabular-nums last:pe-6">
                    {dollars(PLANS[id].seatCents)}
                  </TableCell>
                ))}
              </TableRow>
              {COMPARISON.map((group) => (
                <Fragment key={group.section}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={PLAN_IDS.length + 1} className="ps-6 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {group.section}
                    </TableCell>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="ps-6">{row.label}</TableCell>
                      {PLAN_IDS.map((id) => (
                        <TableCell key={id} className="last:pe-6">
                          <span className="flex justify-center">
                            <CellValue value={row.values[id]} />
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Questions about seats, trials or invoices?{" "}
        <Link href="/faqs" className="font-medium text-primary underline-offset-4 hover:underline">
          Read the FAQs
        </Link>
      </p>
    </>
  )
}
