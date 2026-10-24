import { BellRingIcon, CheckIcon, FileSpreadsheetIcon, GitBranchIcon, GlobeIcon, LayersIcon, PlugIcon, SplitIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Section, SectionHeading } from "./section-heading"

/** Monthly retention by signup cohort, in percent. Fixed values, drawn as a heatmap. */
const COHORTS = [
  { label: "May", values: [100, 94, 90, 87, 85, 84] },
  { label: "Jun", values: [100, 95, 91, 89, 87] },
  { label: "Jul", values: [100, 93, 90, 88] },
  { label: "Aug", values: [100, 96, 93] },
  { label: "Sep", values: [100, 95] },
  { label: "Oct", values: [100] },
]

/** This month's revenue movement in thousands of dollars. Fixed values. */
const MOVEMENT = [
  { label: "New", value: 38.2 },
  { label: "Expansion", value: 21.6 },
  { label: "Contraction", value: -6.1 },
  { label: "Churn", value: -9.8 },
]

const ANALYSIS_FEATURES = [
  { icon: LayersIcon, title: "Cohorts by plan", description: "Split retention by plan, region or acquisition channel." },
  { icon: SplitIcon, title: "Revenue movement", description: "New, expansion, contraction and churn, every month." },
  { icon: UsersIcon, title: "Subscriber timelines", description: "Every upgrade, pause and refund for one account." },
  { icon: BellRingIcon, title: "Quiet alerts", description: "A note when churn or failed payments break the pattern." },
]

const WORKFLOW_FEATURES = [
  { icon: PlugIcon, title: "Connects in minutes", description: "Read-only links to the major billing platforms." },
  { icon: GlobeIcon, title: "Every currency", description: "Normalised to yours at the rate on the invoice date." },
  { icon: FileSpreadsheetIcon, title: "Exports that balance", description: "CSV and spreadsheet exports that tie to the totals." },
  { icon: GitBranchIcon, title: "Versioned metrics", description: "Change a definition and see the before and after." },
]

function FeatureList({ items }: { items: typeof ANALYSIS_FEATURES }) {
  return (
    <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <item.icon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden />
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-medium">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={cn("rounded-xl border bg-card p-5 shadow-(--surface-shadow-raised) sm:p-6", className)}>
      <figcaption className="mb-5 text-sm font-medium">{title}</figcaption>
      {children}
    </figure>
  )
}

function CohortGrid() {
  return (
    <Panel title="Revenue retention by signup cohort">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0.5 text-center sm:border-spacing-1">
          <thead>
            <tr>
              <th scope="col" className="w-10 text-start text-[11px] font-normal text-muted-foreground sm:w-12">
                Cohort
              </th>
              {[0, 1, 2, 3, 4, 5].map((month) => (
                <th key={month} scope="col" className="font-mono text-[11px] font-normal text-muted-foreground">
                  M{month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORTS.map((cohort) => (
              <tr key={cohort.label}>
                <th scope="row" className="text-start text-xs font-normal text-muted-foreground">
                  {cohort.label}
                </th>
                {[0, 1, 2, 3, 4, 5].map((month) => {
                  const value = cohort.values[month]
                  if (value === undefined) {
                    return <td key={month} className="h-8 rounded-md bg-muted/40 sm:h-9" />
                  }
                  // M0 is always 100%: solid primary. Later months tint from 12% to 60% so dark text keeps its contrast.
                  const strength = value === 100 ? 100 : 12 + (Math.max(0, value - 84) / 12) * 48
                  return (
                    <td
                      key={month}
                      className={cn("num h-8 rounded-md text-[10px] sm:h-9 sm:text-xs", value === 100 ? "text-primary-foreground" : "text-foreground")}
                      style={{ backgroundColor: `color-mix(in oklch, var(--primary) ${strength.toFixed(0)}%, var(--card))` }}
                    >
                      {value}%
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function RevenueMovement({ className }: { className?: string }) {
  const net = MOVEMENT.reduce((sum, row) => sum + row.value, 0)
  const largest = Math.max(...MOVEMENT.map((row) => Math.abs(row.value)))
  return (
    <Panel title="MRR movement, October" className={className}>
      <ul className="flex flex-col gap-3">
        {MOVEMENT.map((row) => (
          <li key={row.label} className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="h-2 rounded-full bg-muted">
              <span
                className={cn("block h-full rounded-full", row.value > 0 ? "bg-primary" : "bg-chart-3")}
                style={{ width: `${(Math.abs(row.value) / largest) * 100}%` }}
              />
            </span>
            <span className="num text-end">
              {row.value > 0 ? "+" : "-"}${Math.abs(row.value).toFixed(1)}k
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <CheckIcon className="size-4 text-success" aria-hidden />
          Net new MRR
        </span>
        <span className="num font-semibold">+${net.toFixed(1)}k</span>
      </div>
    </Panel>
  )
}

export function Features() {
  return (
    <Section id="features" className="bg-muted/40">
      <SectionHeading
        eyebrow="Product"
        title="Every subscription metric, explained down to the invoice"
        lede="Connect billing once. Tidewell builds the revenue model, keeps it current, and shows its working whenever someone asks why."
      />

      <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <CohortGrid />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold tracking-tight text-balance">See who stays, and why</h3>
            <p className="text-pretty text-muted-foreground">
              Cohorts, movement and subscriber timelines sit on one model, so a dip in retention leads straight to the accounts behind it.
            </p>
          </div>
          <FeatureList items={ANALYSIS_FEATURES} />
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold tracking-tight text-balance">Fits the way finance already works</h3>
            <p className="text-pretty text-muted-foreground">
              Multi-currency, versioned definitions and exports that balance mean Tidewell slots into the month-end close instead of adding to it.
            </p>
          </div>
          <FeatureList items={WORKFLOW_FEATURES} />
        </div>
        <RevenueMovement className="order-1 lg:order-2" />
      </div>
    </Section>
  )
}
