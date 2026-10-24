import { ArrowUpRightIcon, BarChart3Icon, LayoutGridIcon, RepeatIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A drawn preview of the Tidewell dashboard, built from markup and one SVG so
 * it costs no image bytes and follows the theme. Every value is fixed.
 */
const MRR_BY_MONTH = [312, 326, 335, 349, 361, 372, 390, 404, 419, 437, 458, 482]
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]

const KPIS = [
  { label: "MRR", value: "$482.3k", change: "+5.2%" },
  { label: "Net revenue retention", value: "112%", change: "+1.4 pts" },
  { label: "Logo churn", value: "1.8%", change: "-0.3 pts" },
  { label: "Active subscriptions", value: "6,204", change: "+188" },
]

const NAV = [
  { label: "Overview", icon: LayoutGridIcon, active: true },
  { label: "Revenue", icon: BarChart3Icon },
  { label: "Subscribers", icon: UsersIcon },
  { label: "Retention", icon: RepeatIcon },
]

function chartPaths(width: number, height: number) {
  const min = 280
  const max = 500
  const step = width / (MRR_BY_MONTH.length - 1)
  const points = MRR_BY_MONTH.map((value, index) => [index * step, height - ((value - min) / (max - min)) * height] as const)
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  return { line, area: `${line} L${width} ${height} L0 ${height} Z`, last: points[points.length - 1] }
}

export function ProductPreview({ className }: { className?: string }) {
  const { line, area, last } = chartPaths(600, 180)

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card text-card-foreground shadow-(--surface-shadow-raised)", className)} role="img" aria-label="Tidewell dashboard preview: MRR of $482.3k, up 5.2% this month">
      <div className="flex h-9 items-center gap-1.5 border-b bg-muted/50 px-3" aria-hidden>
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ms-3 truncate font-mono text-[11px] text-muted-foreground">app.tidewell.example/overview</span>
      </div>
      <div className="flex" aria-hidden>
        <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-e bg-sidebar p-3 lg:flex">
          {NAV.map((item) => (
            <span
              key={item.label}
              className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground", item.active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground")}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </span>
          ))}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="flex flex-col gap-1 rounded-lg border bg-background/60 p-3">
                <span className="truncate text-[11px] text-muted-foreground">{kpi.label}</span>
                <span className="num text-lg font-semibold tracking-tight sm:text-xl">{kpi.value}</span>
                <span className="num text-[11px] text-success">{kpi.change}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-background/60 p-3 sm:p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Monthly recurring revenue</span>
                <span className="num text-2xl font-semibold tracking-tight">$482,310</span>
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <ArrowUpRightIcon className="size-3" />
                5.2%
              </span>
            </div>
            <svg viewBox="0 0 600 196" className="h-auto w-full overflow-visible" preserveAspectRatio="none">
              {[0, 45, 90, 135, 180].map((y) => (
                <line key={y} x1="0" x2="600" y1={y} y2={y} className="stroke-border" strokeDasharray="2 4" />
              ))}
              <path d={area} className="fill-primary/10" />
              <path d={line} fill="none" strokeWidth="2" strokeLinejoin="round" className="stroke-primary" vectorEffect="non-scaling-stroke" />
              <circle cx={last[0]} cy={last[1]} r="4" className="fill-primary stroke-card" strokeWidth="2" />
            </svg>
            <div className="mt-2 hidden justify-between font-mono text-[10px] text-muted-foreground sm:flex">
              {MONTHS.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
