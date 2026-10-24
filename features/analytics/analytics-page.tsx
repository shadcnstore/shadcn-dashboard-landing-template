"use client"

import { DownloadIcon } from "lucide-react"
import Link from "next/link"
import { parseAsNumberLiteral, useQueryState } from "nuqs"
import { useMemo, useState } from "react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { PLANS, workspace } from "@/data/generate"
import type { Account } from "@/data/schema"
import { TEAM_BY_ID, TeamAvatar } from "@/features/tasks/team-avatar"
import { PunchCard } from "@/kit/charts/punch-card"
import { downloadCsv } from "@/kit/data/csv"
import {
  change,
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
} from "@/kit/data/format"
import type { SortRule } from "@/kit/data/list"
import { DataTable, type DataColumn } from "@/kit/data-table/data-table"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { Segmented } from "@/kit/ui-patterns/segmented"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { Widget, WidgetHeader, WidgetValue } from "@/kit/widgets/widget"
import { cn } from "@/lib/utils"

import {
  analyticsMetrics,
  monthLabel,
  PERIODS,
  type Cohort,
  type MixRow,
  type Period,
} from "./metrics"
import { MrrMovementChart } from "@/components/chronicle/charts"

import { MOVEMENT_CONFIG } from "./movement-config"
import {
  busiestSlot,
  USAGE_CELLS,
  USAGE_DAYS,
  USAGE_HOURS,
  WEEKDAY_SHARE,
  WEEKLY_REPORTS,
} from "./usage"

const money = (cents: number) => formatMoney(cents, { compact: true })
const signedMoney = (cents: number) =>
  `${cents >= 0 ? "+" : "-"}${money(Math.abs(cents))}`

const PERIOD_LABEL: Record<Period, string> = {
  3: "3 months",
  6: "6 months",
  12: "12 months",
}

function DownloadItem({ onClick }: { onClick: () => void }) {
  return (
    <DropdownMenuItem onClick={onClick}>
      <DownloadIcon />
      Download CSV
    </DropdownMenuItem>
  )
}

// ---------------------------------------------------------------------------
// Headline
// ---------------------------------------------------------------------------

interface Figure {
  label: string
  value: string
  delta: number | null
  caption: string
  invert?: boolean
}

function Headline({ figures }: { figures: Figure[] }) {
  return (
    <Widget className="gap-0 overflow-hidden py-0">
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {figures.map((figure) => (
          <div
            key={figure.label}
            className="flex flex-col gap-2 bg-card py-(--card-spacing)"
          >
            <span className="px-(--card-spacing) text-sm text-muted-foreground">
              {figure.label}
            </span>
            <WidgetValue
              value={figure.value}
              delta={figure.delta}
              invert={figure.invert}
              caption={figure.caption}
              size="md"
            />
          </div>
        ))}
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// MRR movement
// ---------------------------------------------------------------------------

function Movement({
  metrics,
  period,
}: {
  metrics: ReturnType<typeof analyticsMetrics>
  period: Period
}) {
  const { months, totals, previous } = metrics.period
  const current = workspace().mrr.at(-1)!.month
  const parts = [
    { key: "newCents", value: totals.newCents, sign: 1 },
    { key: "expansionCents", value: totals.expansionCents, sign: 1 },
    { key: "contractionCents", value: totals.contractionCents, sign: -1 },
    { key: "churnCents", value: totals.churnCents, sign: -1 },
  ] as const

  return (
    <Widget className="xl:col-span-8">
      <WidgetHeader
        title="MRR movement"
        menu={
          <DownloadItem
            onClick={() =>
              downloadCsv(
                `mrr-movement-${period}m.csv`,
                [
                  "Month",
                  "New",
                  "Expansion",
                  "Contraction",
                  "Churn",
                  "Net new",
                  "MRR",
                ],
                months.map((month) => [
                  month.month,
                  month.newCents / 100,
                  month.expansionCents / 100,
                  -month.contractionCents / 100,
                  -month.churnCents / 100,
                  (month.newCents +
                    month.expansionCents -
                    month.contractionCents -
                    month.churnCents) /
                    100,
                  month.mrrCents / 100,
                ])
              )
            }
          />
        }
      />
      <WidgetValue
        value={signedMoney(totals.netCents)}
        delta={change(totals.netCents, previous.totals.netCents)}
        caption={`net new MRR in ${PERIOD_LABEL[period]} · ${signedMoney(previous.totals.netCents)} the ${PERIOD_LABEL[period]} before`}
      />
      <MrrMovementChart
        months={months}
        partialMonth={current}
        className="min-h-72 flex-1 px-2"
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t px-(--card-spacing) pt-4 sm:grid-cols-4">
        {parts.map((part) => (
          <div key={part.key} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: MOVEMENT_CONFIG[part.key].color }}
                aria-hidden
              />
              {MOVEMENT_CONFIG[part.key].label}
            </span>
            <span
              className={cn(
                "font-mono text-lg font-semibold tabular-nums",
                part.sign < 0 && part.value > 0 && "text-destructive"
              )}
            >
              {part.sign > 0 ? "+" : "-"}
              {money(part.value)}
            </span>
          </div>
        ))}
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Revenue mix
// ---------------------------------------------------------------------------

const MIX_TONES = [
  "var(--chart-lead)",
  "var(--chart-2)",
  "var(--chart-3)",
  "color-mix(in oklch, var(--muted-foreground) 45%, transparent)",
]

function Mix<K extends string>({
  title,
  rows,
  total,
  className,
  file,
}: {
  title: string
  rows: MixRow<K>[]
  total: number
  className?: string
  file: string
}) {
  const lead = rows.reduce(
    (best, row) => (row.mrrCents > best.mrrCents ? row : best),
    rows[0]
  )
  return (
    <Widget className={className}>
      <WidgetHeader
        title={title}
        menu={
          <DownloadItem
            onClick={() =>
              downloadCsv(
                file,
                ["Segment", "Accounts", "MRR", "Share"],
                rows.map((row) => [
                  row.label,
                  row.accounts,
                  row.mrrCents / 100,
                  Number(row.share.toFixed(4)),
                ])
              )
            }
          />
        }
      />
      <WidgetValue
        value={formatPercent(lead.share)}
        caption={`of MRR from ${lead.label}`}
      />
      <div className="px-(--card-spacing)">
        {/* Segment widths are data. */}
        <div
          className="flex h-3 gap-0.5 overflow-hidden rounded-full"
          role="img"
          aria-label={rows
            .map((row) => `${row.label} ${formatPercent(row.share)}`)
            .join(", ")}
        >
          {rows.map((row, index) => (
            <span
              key={row.key}
              className="h-full first:rounded-s-full last:rounded-e-full"
              style={{
                width: `${row.share * 100}%`,
                backgroundColor: MIX_TONES[index],
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col px-(--card-spacing)">
        <div className="grid grid-cols-[1fr_auto_5.5rem] gap-3 border-b pb-2 text-xs font-medium text-muted-foreground">
          <span />
          <span className="text-end">Accounts</span>
          <span className="text-end">MRR</span>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.key}
            className="grid grid-cols-[1fr_auto_5.5rem] items-center gap-3 border-b py-2.5 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: MIX_TONES[index] }}
                aria-hidden
              />
              <span className="truncate">{row.label}</span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatPercent(row.share, { decimals: 0 })}
              </span>
            </span>
            <span className="text-end font-mono text-muted-foreground tabular-nums">
              {formatNumber(row.accounts)}
            </span>
            <span className="text-end font-mono tabular-nums">
              {money(row.mrrCents)}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_auto_5.5rem] items-center gap-3 pt-2.5 text-sm font-medium">
          <span>Total MRR</span>
          <span className="text-end font-mono tabular-nums">
            {formatNumber(rows.reduce((count, row) => count + row.accounts, 0))}
          </span>
          <span className="text-end font-mono tabular-nums">
            {money(total)}
          </span>
        </div>
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Cohorts
// ---------------------------------------------------------------------------

function Cohorts({ cohorts }: { cohorts: Cohort[] }) {
  const span = cohorts[0]?.retained.length ?? 0
  const values = cohorts.flatMap((cohort) => cohort.retained.slice(1))
  const floor = Math.min(1, ...values)
  const average = (offset: number) => {
    const at = cohorts
      .filter((cohort) => cohort.retained.length > offset && cohort.size > 0)
      .map((cohort) => cohort.retained[offset])
    return at.length
      ? at.reduce((total, value) => total + value, 0) / at.length
      : null
  }
  const sixMonth = average(6)
  return (
    <Widget className="xl:col-span-12">
      <WidgetHeader
        title="Retention by signup cohort"
        menu={
          <DownloadItem
            onClick={() =>
              downloadCsv(
                "cohort-retention.csv",
                [
                  "Cohort",
                  "Accounts",
                  ...Array.from(
                    { length: span },
                    (_, index) => `Month ${index}`
                  ),
                ],
                cohorts.map((cohort) => [
                  cohort.month,
                  cohort.size,
                  ...Array.from({ length: span }, (_, index) =>
                    index < cohort.retained.length
                      ? Number(cohort.retained[index].toFixed(4))
                      : null
                  ),
                ])
              )
            }
          />
        }
      />
      <WidgetValue
        value={sixMonth === null ? "n/a" : formatPercent(sixMonth)}
        caption="of accounts still paying six months after they start, averaged across cohorts"
      />
      <div tabIndex={0} role="region" aria-label="Retention table, scrolls sideways" className="overflow-x-auto rounded-md px-(--card-spacing) pb-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <table
          className="w-full min-w-[40rem] table-fixed border-separate border-spacing-0.5 text-xs"
          aria-label="Share of each signup cohort still paying, by month since signup"
        >
          <thead>
            <tr className="text-muted-foreground">
              <th className="w-24 pe-2 pb-1 text-start font-medium">Cohort</th>
              <th className="w-14 pe-2 pb-1 text-end font-medium">Accts</th>
              {Array.from({ length: span }, (_, index) => (
                <th
                  key={index}
                  className="pb-1 text-center font-mono font-medium"
                >
                  M{index}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort.month}>
                <th
                  scope="row"
                  className="pe-2 text-start font-mono font-medium whitespace-nowrap"
                >
                  {monthLabel(cohort.month, true)}
                </th>
                <td className="pe-2 text-end font-mono text-muted-foreground tabular-nums">
                  {cohort.size}
                </td>
                {Array.from({ length: span }, (_, index) => {
                  const value = cohort.retained[index]
                  if (value === undefined) {
                    return <td key={index} />
                  }
                  // The scale starts at the lowest retention on screen, so small differences still read.
                  const strength =
                    floor >= 1
                      ? 0.55
                      : 0.1 + ((value - floor) / (1 - floor)) * 0.45
                  return (
                    <td
                      key={index}
                      title={`${monthLabel(cohort.month, true)}, month ${index}: ${formatPercent(value)}`}
                      className={cn(
                        "h-8 rounded-md text-center font-mono tabular-nums",
                        // The scale stops at 55% so text in the theme's own colour stays readable in both modes.
                        "text-foreground"
                      )}
                      style={{
                        backgroundColor: `color-mix(in oklch, var(--chart-lead) ${Math.round(strength * 100)}%, var(--muted))`,
                      }}
                    >
                      {Math.round(value * 100)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Product usage
// ---------------------------------------------------------------------------

function Usage() {
  const peak = busiestSlot()
  return (
    <Widget className="xl:col-span-12">
      <WidgetHeader
        title="When customers open reports"
        menu={
          <DownloadItem
            onClick={() =>
              downloadCsv(
                "reports-by-hour.csv",
                ["Day", ...USAGE_HOURS.map((hour) => `${hour}:00`)],
                USAGE_DAYS.map((day, y) => [
                  day,
                  ...USAGE_HOURS.map((_, x) => USAGE_CELLS[y * 24 + x].value),
                ])
              )
            }
          />
        }
      />
      <WidgetValue
        value={formatNumber(WEEKLY_REPORTS)}
        caption={`reports in a typical week · busiest ${peak.day} ${peak.hour}:00 UTC · ${formatPercent(WEEKDAY_SHARE, { decimals: 0 })} on weekdays`}
      />
      <div tabIndex={0} role="region" aria-label="Top accounts, scrolls sideways" className="overflow-x-auto rounded-md px-(--card-spacing) outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <PunchCard
          className="min-w-[44rem]"
          cells={USAGE_CELLS}
          columns={USAGE_HOURS}
          rows={[...USAGE_DAYS]}
          format={(value) => `${value} reports`}
        />
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Top accounts
// ---------------------------------------------------------------------------

type TopRow = Account & { share: number }

const STATUS_TONE = {
  active: "success",
  past_due: "warning",
  trialing: "info",
  churned: "muted",
} as const
const STATUS_LABEL = {
  active: "Active",
  past_due: "Past due",
  trialing: "Trialing",
  churned: "Churned",
} as const

function TopAccounts({ rows }: { rows: TopRow[] }) {
  const [sort, setSort] = useState<SortRule[]>([{ id: "mrr", desc: true }])
  const sorted = useMemo(() => {
    const rule = sort[0]
    if (!rule) {
      return rows
    }
    const value = (row: TopRow): string | number =>
      rule.id === "name"
        ? row.name.toLowerCase()
        : rule.id === "seats"
          ? row.seats
          : rule.id === "started"
            ? row.startedAt
            : row.mrrCents
    return [...rows].sort(
      (a, b) =>
        (value(a) < value(b) ? -1 : value(a) > value(b) ? 1 : 0) *
        (rule.desc ? -1 : 1)
    )
  }, [rows, sort])

  const columns: DataColumn<TopRow>[] = [
    {
      id: "name",
      header: "Account",
      sortId: "name",
      hideable: false,
      cell: (row) => (
        <Link
          href={`/users?account=${row.id}`}
          className="flex min-w-0 flex-col hover:underline"
        >
          <span className="truncate font-medium">{row.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.industry} · {row.region}
          </span>
        </Link>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      cell: (row) => PLANS[row.plan].name,
      className: "hidden sm:table-cell",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={STATUS_TONE[row.status]}>
          {STATUS_LABEL[row.status]}
        </StatusBadge>
      ),
      className: "hidden md:table-cell",
    },
    {
      id: "seats",
      header: "Seats",
      sortId: "seats",
      sortDescFirst: true,
      className: "hidden lg:table-cell text-end",
      cell: (row) => (
        <span
          className={cn(
            "font-mono tabular-nums",
            row.seats > row.seatLimit && "text-destructive"
          )}
        >
          {row.seats}
          <span className="text-muted-foreground">/{row.seatLimit}</span>
        </span>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      className: "hidden lg:table-cell",
      cell: (row) => <TeamAvatar member={TEAM_BY_ID.get(row.ownerId)} />,
    },
    {
      id: "started",
      header: "Customer since",
      sortId: "started",
      className: "hidden xl:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDate(row.startedAt, "month")}
        </span>
      ),
    },
    {
      id: "mrr",
      header: "MRR",
      sortId: "mrr",
      sortDescFirst: true,
      hideable: false,
      className: "text-end pe-4",
      cell: (row) => (
        <span className="flex flex-col items-end">
          <span className="font-mono font-medium tabular-nums">
            {formatMoney(row.mrrCents)}
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {formatPercent(row.share)} of MRR
          </span>
        </span>
      ),
    },
  ]

  return (
    <Widget className="xl:col-span-12">
      <WidgetHeader
        title="Top accounts"
        menu={
          <DownloadItem
            onClick={() =>
              downloadCsv(
                "top-accounts.csv",
                [
                  "Account",
                  "Plan",
                  "Region",
                  "Status",
                  "Seats",
                  "Seat limit",
                  "Owner",
                  "Customer since",
                  "MRR",
                  "Share of MRR",
                ],
                sorted.map((row) => [
                  row.name,
                  PLANS[row.plan].name,
                  row.region,
                  STATUS_LABEL[row.status],
                  row.seats,
                  row.seatLimit,
                  TEAM_BY_ID.get(row.ownerId)?.name ?? "",
                  row.startedAt.slice(0, 10),
                  row.mrrCents / 100,
                  Number(row.share.toFixed(4)),
                ])
              )
            }
          />
        }
      />
      <div className="px-(--card-spacing) [&_[data-slot=table-container]]:rounded-none">
        <DataTable
          label="Top accounts by MRR"
          columns={columns}
          rows={sorted}
          getRowId={(row) => row.id}
          loading={false}
          sort={sort}
          onSortChange={setSort}
          empty={null}
        />
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AnalyticsPage() {
  const [periodParam, setPeriod] = useQueryState(
    "period",
    parseAsNumberLiteral(PERIODS).withDefault(6)
  )
  const period = periodParam as Period
  const data = workspace()
  const metrics = useMemo(() => analyticsMetrics(data, period), [data, period])
  const { period: summary } = metrics
  const lastMonth = data.mrr.at(-1)!
  const accountsBefore = data.mrr.at(-1 - period)?.accounts ?? 0
  const grossChurn = summary.startCents
    ? summary.totals.churnCents / summary.startCents
    : 0
  const previousGrossChurn = summary.previous.startCents
    ? summary.previous.totals.churnCents / summary.previous.startCents
    : 0

  const figures: Figure[] = [
    {
      label: "MRR",
      value: money(summary.endCents),
      delta: change(summary.endCents, summary.startCents),
      caption: `from ${money(summary.startCents)}`,
    },
    {
      label: "Paying accounts",
      value: formatNumber(lastMonth.accounts),
      delta: change(lastMonth.accounts, accountsBefore),
      caption: `from ${formatNumber(accountsBefore)}`,
    },
    {
      label: "Expansion MRR",
      value: `+${money(summary.totals.expansionCents)}`,
      delta: change(
        summary.totals.expansionCents,
        summary.previous.totals.expansionCents
      ),
      caption: "seats added",
    },
    {
      label: "Churned MRR",
      value: `-${money(summary.totals.churnCents)}`,
      delta: change(
        summary.totals.churnCents,
        summary.previous.totals.churnCents
      ),
      invert: true,
      caption: `${formatPercent(grossChurn)} of starting MRR · was ${formatPercent(previousGrossChurn)}`,
    },
  ]

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Where Tidewell's recurring revenue comes from, who stays and when customers use it. Compared with the ${PERIOD_LABEL[period]} before.`}
        actions={
          <Segmented
            aria-label="Period"
            className="w-auto"
            value={String(period) as `${Period}`}
            onChange={(value) => setPeriod(Number(value) as Period)}
            options={PERIODS.map((value) => ({
              value: String(value) as `${Period}`,
              label: `${value} months`,
            }))}
          />
        }
      />
      <Headline figures={figures} />
      <div className="grid gap-4 xl:grid-cols-12">
        <Movement metrics={metrics} period={period} />
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <Mix
            title="Revenue by plan"
            rows={metrics.plans}
            total={summary.endCents}
            file="revenue-by-plan.csv"
          />
          <Mix
            title="Revenue by region"
            rows={metrics.regions}
            total={summary.endCents}
            file="revenue-by-region.csv"
          />
        </div>
        <Cohorts cohorts={metrics.cohorts} />
        <Usage />
        <TopAccounts rows={metrics.top} />
      </div>
    </>
  )
}
