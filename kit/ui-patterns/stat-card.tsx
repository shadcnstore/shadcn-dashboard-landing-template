import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { formatPercent } from "../data/format"

/**
 * A headline number with its change against the previous period. `invert`
 * is for metrics where down is good (refund rate, fulfilment time).
 */
export function StatCard({
  label,
  value,
  change,
  hint,
  invert = false,
  loading = false,
  children,
}: {
  label: string
  value: React.ReactNode
  change?: number | null
  hint?: string
  invert?: boolean
  loading?: boolean
  children?: React.ReactNode
}) {
  const up = (change ?? 0) >= 0
  const good = invert ? !up : up
  return (
    <Card className="@container/card gap-3">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {loading ? <Skeleton className="h-8 w-28" /> : value}
        </CardTitle>
        {!loading && change !== undefined && change !== null && (
          <CardAction>
            <Badge variant="outline" className={cn("tabular-nums", good ? "text-success" : "text-destructive")}>
              {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {formatPercent(change, { signed: true })}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(hint || children) && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {children}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </CardFooter>
      )}
    </Card>
  )
}
