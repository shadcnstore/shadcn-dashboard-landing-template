import {
  ArrowRightIcon,
  BellRingIcon,
  ColumnsIcon,
  FileSpreadsheetIcon,
  FilterIcon,
  KanbanIcon,
  LayersIcon,
  ListChecksIcon,
  SplitIcon,
  TagIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Screenshot, Section, SectionHeading } from "./section-heading"

type Feature = { icon: React.ComponentType<{ className?: string }>; title: string; description: string }

/** Three rows, each a real Chronicle screen (public/landing, captured from the running app) beside what it does. */
const ROWS: { screen: string; alt: string; title: string; lede: string; href: string; cta: string; features: Feature[] }[] = [
  {
    screen: "analytics",
    alt: "Analytics: MRR, paying accounts, expansion and churn, MRR movement and revenue by plan",
    title: "Revenue you can explain",
    lede: "Every movement in MRR, split into new, expansion, contraction and churn, with the plans and regions behind it.",
    href: "/analytics",
    cta: "Open Analytics",
    features: [
      { icon: SplitIcon, title: "MRR movement", description: "New, expansion, contraction and churn, month by month." },
      { icon: LayersIcon, title: "Cohorts by plan", description: "Retention split by plan, region and start month." },
      { icon: TagIcon, title: "Revenue by plan", description: "Accounts and MRR on Starter, Growth and Scale." },
      { icon: FileSpreadsheetIcon, title: "Exports that balance", description: "CSV that ties back to the totals on screen." },
    ],
  },
  {
    screen: "users",
    alt: "Users: every person across customer accounts, with role, plan, status, seats and last activity",
    title: "Every customer, every seat",
    lede: "One table for every person at every account: who is active, who is invited, and which accounts use more seats than they pay for.",
    href: "/users",
    cta: "Open Users",
    features: [
      { icon: FilterIcon, title: "Saved views", description: "Admins, invited, suspended and over the seat limit." },
      { icon: UserCogIcon, title: "Roles in place", description: "Change a role from the row, or many at once." },
      { icon: ColumnsIcon, title: "Your columns", description: "Show, hide and sort what your team needs." },
      { icon: UsersIcon, title: "A page per person", description: "Account, plan, seats and activity for each user." },
    ],
  },
  {
    screen: "tasks",
    alt: "Tasks: Chronicle's backlog as a board with backlog, to do, in progress and review columns",
    title: "The work that follows the numbers",
    lede: "A failed payment or a seat overage becomes a task with an owner and a due date, on a board or a table.",
    href: "/tasks",
    cta: "Open Tasks",
    features: [
      { icon: KanbanIcon, title: "Board and table", description: "Drag between columns, or sort and filter a list." },
      { icon: ListChecksIcon, title: "Labels and priority", description: "Bugs, features and docs, from urgent to low." },
      { icon: BellRingIcon, title: "Alerts that land", description: "Failed payments and churn reach the right person." },
      { icon: UsersIcon, title: "Owners on every card", description: "Each task shows who has it and when it is due." },
    ],
  },
]

export function Features() {
  return (
    <Section id="features" className="bg-muted/50" labelledBy="features-title">
      <SectionHeading
        id="features-title"
        eyebrow="Product"
        title="Everything a subscription team checks before lunch"
        lede="Revenue, customers and the team's work, on screens you can open right now. Every number on them comes from one set of records."
      />
      <div className="mt-16 flex flex-col gap-20 sm:mt-20 lg:gap-28">
        {ROWS.map((row, index) => (
          <div key={row.screen} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <figure className={cn("relative", index % 2 === 1 && "lg:order-2")}>
              <div aria-hidden className="absolute inset-x-6 -bottom-3 h-full rounded-2xl border border-primary/10 bg-primary/5" />
              <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card p-1.5 shadow-(--surface-shadow-raised)">
                <Screenshot name={row.screen} alt={row.alt} widths={[720, 1200]} width={1200} height={811} sizes="(min-width: 1024px) 600px, 94vw" className="rounded-xl" />
              </div>
            </figure>
            <div className="flex flex-col gap-6">
              <h3 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{row.title}</h3>
              <p className="text-lg text-pretty text-muted-foreground">{row.lede}</p>
              <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {row.features.map((feature) => (
                  <li key={feature.title} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-4" aria-hidden />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href={row.href} className={cn(buttonVariants(), "px-4")}>
                  {row.cta}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
                <a href="#pricing" className={cn(buttonVariants({ variant: "outline" }), "bg-background px-4")}>
                  See pricing
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
