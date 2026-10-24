import { ArrowDownIcon, ArrowUpIcon, MoreVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { formatPercent } from "../data/format"

/**
 * The dashboard widget frame: a soft, borderless card. Every widget in the
 * kit (small, horizontal, XL) is built from this and the parts below, so they
 * share spacing, type and the monospace number style.
 */
export function Widget({ className, children }: { className?: string; children: React.ReactNode }) {
  // Fades in on mount (@starting-style), so a widget replacing its skeleton arrives rather than flashes.
  return <Card className={cn("gap-4 rounded-2xl shadow-(--surface-shadow) ring-foreground/5 transition-opacity duration-250 ease-smooth-out starting:opacity-0 [--card-spacing:--spacing(5)]", className)}>{children}</Card>
}

export function WidgetHeader({
  title,
  icon: Icon,
  action,
  menu,
  className,
}: {
  title: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  /** A link or control on the right, such as "View all". */
  action?: React.ReactNode
  /** DropdownMenuItems for the ⋮ menu. */
  menu?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-2 px-(--card-spacing)", className)}>
      <div className="flex items-center gap-2 text-base font-medium">
        {Icon && <Icon className="size-4 text-primary" />}
        {title}
      </div>
      {action && <div className="-my-1 -me-2 flex items-center">{action}</div>}
      {menu && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="-me-2 -mt-1 text-muted-foreground" aria-label="Widget options" />}>
            <MoreVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>{menu}</DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

/** ↑ 2.5% in green or ↓ 1.2% in red. `invert` for metrics where down is good. */
export function Delta({ value, invert = false, className }: { value: number | null | undefined; invert?: boolean; className?: string }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null
  }
  const up = value >= 0
  const good = invert ? !up : up
  const Icon = up ? ArrowUpIcon : ArrowDownIcon
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-sm font-medium tabular-nums", good ? "text-success" : "text-destructive", className)}>
      <Icon className="size-3.5" />
      {formatPercent(Math.abs(value))}
    </span>
  )
}

/** The big monospace figure with its change and a quiet caption. */
export function WidgetValue({
  value,
  delta,
  invert,
  caption,
  size = "lg",
  className,
}: {
  value: React.ReactNode
  delta?: number | null
  invert?: boolean
  caption?: React.ReactNode
  size?: "md" | "lg" | "xl"
  className?: string
}) {
  const sizes = { md: "text-2xl", lg: "text-3xl", xl: "text-4xl sm:text-5xl" }
  return (
    <div className={cn("flex flex-col gap-1 px-(--card-spacing)", className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {/* Keyed by the figure, so a new value (another date range, say) rises in instead of swapping silently. */}
        <span key={typeof value === "string" || typeof value === "number" ? value : undefined} className={cn("animate-rise font-mono font-semibold tracking-tight tabular-nums", sizes[size])}>
          {value}
        </span>
        {size === "xl" && <Delta value={delta} invert={invert} />}
      </div>
      {(size !== "xl" || caption) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {size !== "xl" && <Delta value={delta} invert={invert} />}
          {caption && <span className="font-mono text-xs text-muted-foreground tabular-nums">{caption}</span>}
        </div>
      )}
    </div>
  )
}

/** A small horizontal widget: the figure on the left, a mini chart on the right. */
export function HorizontalWidget({
  title,
  value,
  delta,
  invert,
  caption,
  children,
}: {
  title: string
  value: string
  delta: number | null
  invert?: boolean
  caption: string
  children: React.ReactNode
}) {
  return (
    <Widget className="flex-row items-center gap-0">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="px-(--card-spacing) text-sm font-medium">{title}</span>
        <WidgetValue value={value} delta={delta} invert={invert} size="md" />
        <span className="truncate px-(--card-spacing) text-xs text-muted-foreground">{caption}</span>
      </div>
      <div className="w-[46%] shrink-0 pe-(--card-spacing)">{children}</div>
    </Widget>
  )
}

export interface PeriodColumn {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  /** Tailwind text colour class for the icon, e.g. "text-chart-2". */
  tone?: string
  value: string
  delta: number | null
  caption: string
}

/** Weekly / Monthly / Quarterly (or any three) side by side, for XL widgets. */
export function PeriodHeader({ columns, className }: { columns: PeriodColumn[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 px-(--card-spacing) sm:grid-cols-3", className)}>
      {columns.map((column) => {
        const Icon = column.icon
        return (
          <div key={column.label} className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              {Icon && <Icon className={cn("size-3.5", column.tone)} />}
              {column.label}
            </span>
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">{column.value}</span>
              <Delta value={column.delta} className="text-xs" />
            </span>
            <span className="truncate text-xs text-muted-foreground">{column.caption}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Label + monospace figures rows under an XL chart. */
export function BreakdownTable({
  rows,
  columns,
  className,
}: {
  rows: { label: string; values: string[]; muted?: boolean }[]
  /** Headings for the value columns, e.g. ["7 days", "30 days", "90 days"]. */
  columns?: string[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-col px-(--card-spacing)", className)}>
      {columns && (
        <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
          <span />
          {columns.map((column) => (
            <span key={column} className="text-end">
              {column}
            </span>
          ))}
        </div>
      )}
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[1.4fr_repeat(3,1fr)] items-center gap-2 border-b py-2.5 text-sm last:border-b-0">
          <span className="truncate text-muted-foreground">{row.label}</span>
          {row.values.map((value, index) => (
            <span key={index} className={cn("text-end font-mono tabular-nums", index === row.values.length - 1 && "text-muted-foreground")}>
              {value}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
