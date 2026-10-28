"use client"

import { CircleHelpIcon, MailIcon, SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useDeferredValue, useState } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { EmptyState } from "@/kit/ui-patterns/query-state"
import { cn } from "@/lib/utils"

import { CATEGORIES, FAQS, type CategoryId } from "./data"

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
