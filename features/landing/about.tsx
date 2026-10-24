import { CalculatorIcon, LockIcon, ScaleIcon, ZapIcon } from "lucide-react"

import { Section, SectionHeading } from "./section-heading"

const VALUES = [
  {
    icon: CalculatorIcon,
    title: "Reconciled, not estimated",
    description: "Every metric ties back to invoices and refunds line by line, so the number in your board deck matches the bank.",
  },
  {
    icon: ScaleIcon,
    title: "Definitions you can read",
    description: "MRR, churn and retention follow written, versioned rules. Change one and Tidewell shows you exactly what moved.",
  },
  {
    icon: ZapIcon,
    title: "Fast by default",
    description: "Dashboards load in under a second on a year of data, because waiting on a spinner is not analysis.",
  },
  {
    icon: LockIcon,
    title: "Yours to keep",
    description: "Read-only billing access, encryption at rest, and a full export of your data whenever you want it.",
  },
]

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        eyebrow="Why Tidewell"
        title="Built by people who have closed the books"
        lede="We spent years rebuilding the same revenue spreadsheet every month. Tidewell is the tool we wanted: exact, explainable, and quick."
      />
      <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <li key={value.title} className="flex flex-col gap-3 bg-card p-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <value.icon className="size-4.5" aria-hidden />
            </span>
            <h3 className="font-semibold tracking-tight">{value.title}</h3>
            <p className="text-sm text-pretty text-muted-foreground">{value.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
