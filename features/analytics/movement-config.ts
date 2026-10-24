import type { ChartConfig } from "@/components/ui/chart"

/** Series names and colours of the MRR movement chart, shared with its legend. A type-only import, so the legend never pulls in Recharts. */
export const MOVEMENT_CONFIG = {
  newCents: { label: "New", color: "var(--chart-lead)" },
  expansionCents: { label: "Expansion", color: "var(--chart-2)" },
  contractionCents: { label: "Contraction", color: "var(--chart-3)" },
  churnCents: { label: "Churn", color: "var(--destructive)" },
  netCents: { label: "Net new", color: "var(--chart-line)" },
} satisfies ChartConfig
