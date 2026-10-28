import { ArrowRightIcon, CalculatorIcon, LayoutDashboardIcon, LockIcon, ScaleIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Section, SectionHeading } from "./section-heading"

const VALUES = [
  {
    icon: CalculatorIcon,
    title: "Reconciled, not estimated",
    description: "Every metric ties back to invoices and refunds line by line, so the number in your board deck matches the bank.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "One place to act",
    description: "The account behind a failed payment, its owner and the task that fixes it sit one click apart.",
  },
  {
    icon: ScaleIcon,
    title: "Definitions you can read",
    description: "MRR, churn and retention follow written rules. Change one and Tidewell shows you exactly what moved.",
  },
  {
    icon: LockIcon,
    title: "Yours to keep",
    description: "Read-only billing access, two-step sign-in on every plan, and your data exported whenever you want it.",
  },
]

export function About() {
  return (
    <Section id="about" labelledBy="about-title">
      <SectionHeading
        id="about-title"
        eyebrow="Why Tidewell"
        title="Built by people who ran the spreadsheet"
        lede="We spent years stitching billing exports, CRM notes and a task list together every month. Tidewell is the tool we wanted: exact numbers, and the work they point to, in one place."
      />
      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <li key={value.title} className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-10 text-center shadow-(--surface-shadow)">
            <span className="relative flex size-20 items-center justify-center">
              <span aria-hidden className="absolute inset-0 [background-image:radial-gradient(color-mix(in_oklch,var(--foreground)_25%,transparent)_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
              <span className="relative flex size-11 items-center justify-center rounded-xl border bg-background shadow-(--surface-shadow)">
                <value.icon className="size-5" aria-hidden />
              </span>
            </span>
            <h3 className="text-lg font-semibold tracking-tight">{value.title}</h3>
            <p className="text-sm text-pretty text-muted-foreground">{value.description}</p>
          </li>
        ))}
      </ul>
      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Try every screen with a year of sample data before you connect anything.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants(), "px-4")}>
            Open the live dashboard
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <a href="#pricing" className={cn(buttonVariants({ variant: "outline" }), "px-4")}>
            See pricing
          </a>
        </div>
      </div>
    </Section>
  )
}
