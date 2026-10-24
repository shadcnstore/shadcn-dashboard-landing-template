import { cn } from "@/lib/utils"

const STATS = [
  { value: "$1.2B", label: "Annual recurring revenue tracked" },
  { value: "4,800", label: "Subscription businesses" },
  { value: "11 min", label: "Median time to a first dashboard" },
  { value: "99.98%", label: "Billing sync uptime, last 12 months" },
]

export function Stats() {
  return (
    <section aria-label="Tidewell in numbers" className="border-y bg-card/60">
      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={cn("flex flex-col gap-1 px-4 py-8 sm:px-8 sm:py-10", index % 2 === 1 && "border-s", index >= 2 && "border-t lg:border-t-0", index === 2 && "lg:border-s")}
          >
            <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="num order-1 text-3xl font-semibold tracking-tight sm:text-4xl">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
