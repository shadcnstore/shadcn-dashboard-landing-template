"use client"

import { CircleHelpIcon, CreditCardIcon, LayersIcon, MailIcon, SearchIcon, ShieldCheckIcon, UserCogIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useDeferredValue, useState } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { TRIAL_DAYS } from "@/data/generate"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { EmptyState } from "@/kit/ui-patterns/query-state"
import { cn } from "@/lib/utils"

type CategoryId = "billing" | "plans" | "data" | "account"

const CATEGORIES: { id: CategoryId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "plans", label: "Plans and seats", icon: LayersIcon },
  { id: "data", label: "Data and security", icon: ShieldCheckIcon },
  { id: "account", label: "Your account", icon: UserCogIcon },
]

/** Tidewell's help centre, the questions its customers actually ask. Replace with your product's. */
const FAQS: { category: CategoryId; question: string; answer: string }[] = [
  { category: "billing", question: "When am I charged?", answer: `Your first charge is at the end of the ${TRIAL_DAYS}-day trial, and then on the same day each month, or each year on yearly billing. Seats you add mid-cycle are charged on the next invoice.` },
  { category: "billing", question: "What happens when a card payment fails?", answer: "We retry the card after 24 hours, then after three and seven days. In the meantime the account shows as past due on the Overview and the owner gets an email with a link to update the card. Nothing is locked while we retry." },
  { category: "billing", question: "Can I pay yearly?", answer: "Yes. Yearly billing costs ten months of the plan's price for twelve months of use. Switch on the Pricing page or in Settings, and the change applies from your next renewal." },
  { category: "billing", question: "Where do I find my invoices?", answer: "Owners and admins see every invoice under Settings, with a PDF for each one. Invoices go to the billing email as well, and you can add a second address for your finance team." },
  { category: "plans", question: "What counts as a seat?", answer: "Every active user on your account. Invited users who have not signed in yet and suspended users do not count, so you can prepare invitations before you pay for them." },
  { category: "plans", question: "What happens if we go over our seat limit?", answer: "Nobody is blocked. The account shows as over its limit, the owner is told, and they can raise the limit with one click. Extra seats are billed at your plan's seat price from the next invoice." },
  { category: "plans", question: "Can I change plans later?", answer: "Any time. An upgrade starts straight away and you pay the difference for the rest of the period. A downgrade starts at the end of the period, so you keep what you paid for." },
  { category: "plans", question: "Is there a free trial?", answer: `Every plan starts with a ${TRIAL_DAYS}-day trial with no card needed. At the end of the trial you choose a plan, or the account pauses and keeps your data for 30 days.` },
  { category: "data", question: "Where does my revenue data come from?", answer: "From your billing provider, connected read-only under Settings, Connections. Subscriptions, invoices and failed payments sync every few minutes, and every figure on the dashboard traces back to them." },
  { category: "data", question: "How is MRR calculated?", answer: "MRR is the monthly value of every active subscription after discounts and before tax. Yearly plans are spread evenly over twelve months, trials count as zero and one-off charges are left out." },
  { category: "data", question: "Do you support single sign-on?", answer: "Yes, on the Scale plan, together with an audit log of every sign-in, role change and export. Two-step sign-in is available on every plan." },
  { category: "data", question: "Can I export my data?", answer: "Growth and Scale export any table as CSV. Scale also syncs accounts, users and MRR movement to your data warehouse every night." },
  { category: "account", question: "How do I invite teammates?", answer: "Open Users and choose Invite, or press Command K and type invite. Pick a role for each person; they get an email and count as a seat once they sign in." },
  { category: "account", question: "Who can change billing?", answer: "The account owner and admins. Members and viewers can see the plan but not change it, and only the owner can cancel." },
  { category: "account", question: "How do I transfer ownership?", answer: "The current owner makes another admin the owner from that person's page in Users. The previous owner stays on as an admin." },
  { category: "account", question: "How do I close my account?", answer: "The owner cancels from Settings. Your data stays available for export for 30 days, then it is deleted and we confirm by email." },
]

/**
 * An example help page for the product the dashboard runs: questions grouped
 * by category, filtered by a search box. Swap FAQS for your own.
 */
export function FaqsPage() {
  const [category, setCategory] = useState<CategoryId | "all">("all")
  const [query, setQuery] = useState("")
  const search = useDeferredValue(query.trim().toLowerCase())

  const matches = FAQS.filter((faq) => (category === "all" || faq.category === category) && (!search || `${faq.question} ${faq.answer}`.toLowerCase().includes(search)))
  const countIn = (id: CategoryId | "all") => FAQS.filter((faq) => (id === "all" || faq.category === id) && (!search || `${faq.question} ${faq.answer}`.toLowerCase().includes(search))).length
  const shown = CATEGORIES.filter((item) => matches.some((faq) => faq.category === item.id))

  return (
    <>
      <PageHeader title="Frequently asked questions" description="Billing, seats, data and your account. Search, or pick a topic." />

      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Topics" className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:pb-0">
          {[{ id: "all" as const, label: "All questions", icon: CircleHelpIcon }, ...CATEGORIES].map((item) => {
            const Icon = item.icon
            const active = category === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="lg:flex-1">{item.label}</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{countIn(item.id)}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex min-w-0 flex-col gap-6">
          <InputGroup className="h-10 bg-card">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput type="search" aria-label="Search the questions" placeholder="Search, for example seats or invoice" value={query} onChange={(event) => setQuery(event.target.value)} />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Clear the search" onClick={() => setQuery("")}>
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          {matches.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              className="rounded-2xl border border-dashed"
              title="No question matches"
              description="Try a shorter word, or look in all topics."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("")
                    setCategory("all")
                  }}
                >
                  Show every question
                </Button>
              }
            />
          ) : (
            shown.map((item) => (
              <section key={item.id} aria-labelledby={`faq-${item.id}`} className="flex flex-col gap-2 rounded-2xl border bg-card px-5 pt-4 pb-1 shadow-(--surface-shadow)">
                <h2 id={`faq-${item.id}`} className="flex items-center gap-2 font-heading text-base font-semibold">
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </h2>
                <Accordion>
                  {matches
                    .filter((faq) => faq.category === item.id)
                    .map((faq) => (
                      <AccordionItem key={faq.question} value={faq.question}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </section>
            ))
          )}

          <div className="flex flex-col items-start gap-4 rounded-2xl border bg-muted/40 p-5 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="font-medium">Still stuck?</p>
              <p className="text-sm text-muted-foreground">Write to the support team. A person answers within one business day.</p>
            </div>
            <a href="mailto:support@example.com" className={buttonVariants({ variant: "outline" })}>
              <MailIcon data-icon="inline-start" />
              Email support
            </a>
            <Link href="/pricing" className={buttonVariants({ variant: "ghost" })}>
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
