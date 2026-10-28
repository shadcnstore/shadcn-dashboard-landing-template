import { ArmchairIcon, Building2Icon, GlobeIcon, UsersIcon } from "lucide-react"

import { workspace } from "@/data/generate"
import { overviewMetrics } from "@/features/overview/metrics"
import { formatNumber } from "@/kit/data/format"
import { DATA_NOW } from "@/lib/clock"

/**
 * Tidewell in numbers, read from the same sample workspace as the dashboard,
 * so the landing page and the Overview always agree.
 */
export function Stats() {
  const data = workspace()
  const metrics = overviewMetrics(data, DATA_NOW)
  const regions = new Set(data.accounts.map((account) => account.region)).size
  const stats = [
    { icon: Building2Icon, value: formatNumber(metrics.accounts.paying), label: "Paying companies", detail: "on Starter, Growth and Scale" },
    { icon: UsersIcon, value: formatNumber(metrics.users.active), label: "Active users", detail: "signed in across those accounts" },
    { icon: ArmchairIcon, value: formatNumber(metrics.seats.used), label: "Seats in use", detail: `of ${formatNumber(metrics.seats.paid)} paid for` },
    { icon: GlobeIcon, value: String(regions), label: "Regions", detail: "where Tidewell's customers are" },
  ]
  return (
    <section aria-label="Tidewell in numbers" className="bg-muted/50 py-16 sm:py-20">
      <ul className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 sm:gap-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <li key={stat.label} className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-4 py-8 text-center shadow-(--surface-shadow) sm:py-10">
            <span className="order-1 flex size-11 items-center justify-center rounded-xl border bg-muted/60">
              <stat.icon className="size-5" aria-hidden />
            </span>
            <p className="order-3 flex flex-col gap-0.5">
              <span className="font-semibold">{stat.label}</span>
              <span className="text-sm text-muted-foreground">{stat.detail}</span>
            </p>
            <p className="order-2 font-mono text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{stat.value}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
