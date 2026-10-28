"use client"

import { CheckCircle2Icon, CreditCardIcon, DownloadIcon, LayersIcon, RefreshCwIcon, UsersIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState, useSyncExternalStore } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { accountContacts, PLANS, workspace } from "@/data/generate"
import type { Account, User } from "@/data/schema"
import { HourBars, PillBars, StepLines } from "@/components/chronicle/charts"
import type { HourDatum } from "@/kit/charts/hour-bars"
import { Heatmap } from "@/components/chronicle/heatmap"
import { downloadCsv } from "@/kit/data/csv"
import { change, formatMoney, formatNumber, formatPercent } from "@/kit/data/format"
import { useKitMutation, useList } from "@/kit/data/hooks"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { EmptyState, ErrorState } from "@/kit/ui-patterns/query-state"
import { PersonAvatar } from "@/components/chronicle/person-avatar"
import { Segmented } from "@/kit/ui-patterns/segmented"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { PeriodHeader, Widget, WidgetHeader, WidgetValue } from "@/kit/widgets/widget"
import { priceCents } from "@/data/generate"
import { DATA_NOW, currentTime } from "@/lib/clock"
import { adapter, type Resources } from "@/lib/data"
import { customerAvatarFor } from "@/lib/avatars"
import { cn } from "@/lib/utils"

import { SIGNUPS_LAST_24H, SIGNUPS_PREVIOUS_24H, USAGE, USAGE_DAYS, USAGE_HOURS } from "./fixed"
import { monthLabel, overviewMetrics } from "./metrics"

const money = (cents: number) => formatMoney(cents, { compact: true })
/** Whole dollars with separators, as finance teams read MRR: $156,497. */
const wholeMoney = (cents: number) => `${cents < 0 ? "-" : ""}$${Math.round(Math.abs(cents) / 100).toLocaleString("en-US")}`
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

function useGreeting() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const hour = currentTime().getUTCHours()
      return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    },
    () => "Welcome back"
  )
}

// ---------------------------------------------------------------------------
// MRR, the hero
// ---------------------------------------------------------------------------

type MrrView = "trend" | "plans"

function MrrWidget({ metrics }: { metrics: ReturnType<typeof overviewMetrics> }) {
  const [view, setView] = useState<MrrView>("trend")
  const { mrr, movement, history, plans } = metrics
  const net = movement.newCents + movement.expansionCents - movement.contractionCents - movement.churnCents

  const exportCsv = () =>
    downloadCsv(
      "chronicle-mrr-12-months.csv",
      ["Month", "MRR (USD)"],
      history.map((row) => [row.month, (row.mrrCents / 100).toFixed(2)])
    )

  return (
    <Widget className="xl:col-span-2">
      <WidgetHeader
        title="Monthly recurring revenue"
        icon={CreditCardIcon}
        menu={
          <>
            <DropdownMenuItem onClick={exportCsv}>
              <DownloadIcon />
              Download CSV
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/analytics" />}>
              <LayersIcon />
              Open analytics
            </DropdownMenuItem>
          </>
        }
      />
      <PeriodHeader
        columns={[
          { label: `${monthLabel(mrr.month)} so far`, value: wholeMoney(mrr.now), delta: change(mrr.now, mrr.lastMonth), caption: `Net new ${net >= 0 ? "+" : "-"}${wholeMoney(Math.abs(net))} this month` },
          { label: monthLabel(mrr.lastMonthKey, true), value: wholeMoney(mrr.lastMonth), delta: change(mrr.lastMonth, metrics.history.at(-3)!.mrrCents), caption: "Month end" },
          { label: monthLabel(mrr.yearAgoKey, true), value: wholeMoney(mrr.yearAgo), delta: null, caption: `${formatPercent(change(mrr.now, mrr.yearAgo) ?? 0)} growth since` },
        ]}
      />
      <div className="flex items-center justify-between gap-3 px-(--card-spacing)">
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground tabular-nums">
          <span>
            New <span className="text-foreground">+{money(movement.newCents)}</span>
          </span>
          <span>
            Expansion <span className="text-foreground">+{money(movement.expansionCents)}</span>
          </span>
          <span>
            Churn <span className="text-destructive">-{money(movement.churnCents + movement.contractionCents)}</span>
          </span>
        </div>
        <Segmented<MrrView>
          aria-label="MRR view"
          value={view}
          onChange={setView}
          className="w-auto shrink-0"
          options={[
            { value: "trend", label: "12 months" },
            { value: "plans", label: "By plan" },
          ]}
        />
      </div>
      {/* Both views share one fixed height, so switching never moves the page. */}
      <div className="h-64 px-(--card-spacing)">
        {view === "trend" ? (
          <PillBars
            data={history.map((row) => ({ label: monthLabel(row.month), title: monthLabel(row.month, true), value: row.mrrCents }))}
            highlight="last"
            format={money}
            className="h-full"
            barSize={22}
          />
        ) : (
          <div className="flex h-full flex-col justify-center">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              {plans.map((row, index) => (
                <span key={row.plan} className={cn("h-full", ["bg-chart-lead", "bg-chart-2", "bg-chart-3"][index])} style={{ width: `${row.share * 100}%` }} />
              ))}
            </div>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">MRR by plan</caption>
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th scope="col" className="py-2 text-start font-medium">
                    Plan
                  </th>
                  <th scope="col" className="py-2 text-end font-medium">
                    Accounts
                  </th>
                  <th scope="col" className="py-2 text-end font-medium">
                    Per account
                  </th>
                  <th scope="col" className="py-2 text-end font-medium">
                    MRR
                  </th>
                  <th scope="col" className="hidden py-2 text-end font-medium sm:table-cell">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {plans.map((row, index) => (
                  <tr key={row.plan} className="border-b">
                    <th scope="row" className="py-2.5 text-start font-sans font-medium">
                      <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", ["bg-chart-lead", "bg-chart-2", "bg-chart-3"][index])} aria-hidden />
                        {row.name}
                      </span>
                    </th>
                    <td className="py-2.5 text-end">{formatNumber(row.accounts)}</td>
                    <td className="py-2.5 text-end">{wholeMoney(row.arpaCents)}</td>
                    <td className="py-2.5 text-end">{wholeMoney(row.mrrCents)}</td>
                    <td className="hidden py-2.5 text-end text-muted-foreground sm:table-cell">{formatPercent(row.share)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="pt-2.5 text-start font-sans font-semibold">
                    Total
                  </th>
                  <td className="pt-2.5 text-end font-semibold">{formatNumber(sum(plans.map((row) => row.accounts)))}</td>
                  <td className="pt-2.5 text-end text-muted-foreground">{wholeMoney(mrr.now / Math.max(1, sum(plans.map((row) => row.accounts))))}</td>
                  <td className="pt-2.5 text-end font-semibold">{wholeMoney(mrr.now)}</td>
                  <td className="hidden pt-2.5 text-end text-muted-foreground sm:table-cell">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Sign-ups in the last 24 hours
// ---------------------------------------------------------------------------

function SignupsWidget() {
  const current = sum(SIGNUPS_LAST_24H)
  const previous = sum(SIGNUPS_PREVIOUS_24H)
  const hours: HourDatum[] = SIGNUPS_LAST_24H.map((value, index) => {
    const ago = SIGNUPS_LAST_24H.length - 1 - index
    return { label: ago === 0 ? "Last hour" : `${ago + 1}h ago`, current: value, previous: SIGNUPS_PREVIOUS_24H[index] }
  })
  return (
    <Widget>
      <WidgetHeader title="Sign-ups, last 24 hours" icon={UserPlusIcon} />
      <WidgetValue value={formatNumber(current)} delta={change(current, previous)} caption={`vs ${formatNumber(previous)} the day before`} />
      <HourBars data={hours} currentLabel="Last 24h" previousLabel="Day before" className="h-20 px-(--card-spacing)" />
      <div className="flex items-center justify-between gap-3 px-(--card-spacing) text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-1.5 rounded-full bg-chart-lead" aria-hidden />
          By hour
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 border-t border-dashed border-chart-line" aria-hidden />
          Day before
        </span>
      </div>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Small widgets
// ---------------------------------------------------------------------------

function AccountsWidget({ metrics }: { metrics: ReturnType<typeof overviewMetrics> }) {
  const { accounts } = metrics
  return (
    <Widget>
      <WidgetHeader title="Paying accounts" icon={LayersIcon} />
      <WidgetValue value={formatNumber(accounts.paying)} delta={change(accounts.paying, accounts.lastMonth)} caption={`vs ${formatNumber(accounts.lastMonth)} last month`} />
      <StepLines
        data={accounts.history.map((row) => ({ month: monthLabel(row.month), accounts: row.accounts }))}
        xKey="month"
        series={[{ key: "accounts", label: "Paying accounts", color: "var(--chart-lead)" }]}
        format={(value) => formatNumber(value)}
        className="h-28 px-(--card-spacing)"
      />
    </Widget>
  )
}

function RetentionWidget({ metrics }: { metrics: ReturnType<typeof overviewMetrics> }) {
  const { retention, movement } = metrics
  const rows = [
    { label: "Expansion", cents: movement.expansionCents, tone: "bg-chart-lead" },
    { label: "Contraction", cents: movement.contractionCents, tone: "bg-chart-3" },
    { label: "Churn", cents: movement.churnCents, tone: "bg-destructive" },
  ]
  const largest = Math.max(...rows.map((row) => row.cents), 1)
  return (
    <Widget>
      <WidgetHeader title="Net revenue retention" icon={RefreshCwIcon} />
      <WidgetValue
        value={formatPercent(retention.net, { decimals: 1 })}
        delta={retention.net - retention.previousNet}
        caption={`${monthLabel(retention.month, true)}, gross ${formatPercent(retention.gross, { decimals: 1 })}`}
      />
      <ul className="flex flex-col gap-2.5 px-(--card-spacing) text-sm" aria-label="This month's movements">
        {rows.map((row) => (
          <li key={row.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span className={cn("block h-full rounded-full", row.tone)} style={{ width: `${(row.cents / largest) * 100}%` }} />
            </span>
            <span className="font-mono text-xs tabular-nums">{money(row.cents)}</span>
          </li>
        ))}
      </ul>
    </Widget>
  )
}

function TrialsWidget({ metrics }: { metrics: ReturnType<typeof overviewMetrics> }) {
  const { trials } = metrics
  return (
    <Widget>
      <WidgetHeader title="New accounts per week" icon={UsersIcon} />
      <WidgetValue value={formatNumber(trials.thisWeek)} delta={change(trials.thisWeek, trials.lastWeek)} caption={`${formatNumber(trials.open)} trials open now`} />
      <PillBars data={trials.weekly.map((week) => ({ label: week.label, title: `Week of ${week.label}`, value: week.value }))} highlight="last" format={(value) => `${value} new`} className="h-32 px-(--card-spacing)" barSize={12} />
    </Widget>
  )
}

function UsersWidget({ metrics }: { metrics: ReturnType<typeof overviewMetrics> }) {
  const { users } = metrics
  return (
    <Widget>
      <WidgetHeader title="New users, last 7 days" icon={UserPlusIcon} />
      <WidgetValue value={formatNumber(users.newLast7)} delta={change(users.newLast7, users.newPrior7)} caption={`vs ${formatNumber(users.newPrior7)} the 7 days before`} />
      <PillBars
        data={users.daily.map((day) => {
          const date = new Date(`${day.day}T12:00:00Z`)
          return {
            label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
            title: date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }),
            value: day.users,
          }
        })}
        highlight="last"
        format={(value) => `${value} users`}
        className="h-32 px-(--card-spacing)"
        barSize={18}
      />
    </Widget>
  )
}

function SeatsWidget({ metrics }: { metrics: ReturnType<typeof overviewMetrics> }) {
  const { seats } = metrics
  return (
    <Widget>
      <WidgetHeader title="Seats in use" icon={UsersIcon} />
      <WidgetValue value={formatPercent(seats.used / seats.paid)} delta={null} caption={`${formatNumber(seats.used)} of ${formatNumber(seats.paid)} paid seats`} />
      <ul className="flex flex-col gap-2.5 px-(--card-spacing) text-sm" aria-label="Seats by plan">
        {seats.byPlan.map((row, index) => (
          <li key={row.plan} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3">
            <span className="text-muted-foreground">{row.name}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span className={cn("block h-full rounded-full", ["bg-chart-lead", "bg-chart-2", "bg-chart-3"][index])} style={{ width: `${Math.min(1, row.used / Math.max(1, row.paid)) * 100}%` }} />
            </span>
            <span className="font-mono text-xs tabular-nums">
              {formatNumber(row.used)}/{formatNumber(row.paid)}
            </span>
          </li>
        ))}
      </ul>
      <p className="px-(--card-spacing) text-xs text-muted-foreground">
        <span className="font-mono text-foreground tabular-nums">{seats.overAccounts}</span> accounts use more seats than they pay for.
      </p>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Needs attention: live through the data adapter
// ---------------------------------------------------------------------------

/**
 * Who to show for each account: its owner, or an admin when the owner's
 * portrait is already on a row above, so a short list never repeats a face.
 */
function pickContacts(accounts: Account[]): Map<string, User> {
  const shown = new Set<string | null>()
  const picked = new Map<string, User>()
  for (const account of accounts) {
    const candidates = accountContacts(account.id)
    const contact = candidates.find((candidate) => !shown.has(customerAvatarFor(candidate.name))) ?? candidates[0]
    if (contact) {
      shown.add(customerAvatarFor(contact.name))
      picked.set(account.id, contact)
    }
  }
  return picked
}

function AttentionWidget() {
  const query = { filters: { attention: ["past-due", "over-limit"] }, sort: [{ id: "mrrCents", desc: true }], pageSize: 6 }
  const list = useList<Resources, "accounts">("accounts", query)
  const retry = useKitMutation((account: Account) => adapter.update("accounts", account.id, { status: "active" }), {
    success: (account) => ({ title: "Payment collected", description: `${account.name} is up to date.` }),
    error: "The retry failed",
    invalidate: ["accounts"],
  })
  const raise = useKitMutation(
    (account: Account) => adapter.update("accounts", account.id, { seatLimit: account.seats, mrrCents: priceCents(account.plan, account.seats) }),
    {
      success: (account) => ({ title: "Seat limit raised", description: `${account.name} now pays for ${account.seatLimit} seats, ${wholeMoney(account.mrrCents)} a month.` }),
      error: "Could not change the limit",
      invalidate: ["accounts"],
    }
  )
  const atRisk = sum((list.data?.rows ?? []).filter((account) => account.status === "past_due").map((account) => account.mrrCents))
  const contacts = useMemo(() => pickContacts(list.data?.rows ?? []), [list.data])

  return (
    <Widget className="gap-0 xl:col-span-2">
      <WidgetHeader
        title={
          <span className="flex items-center gap-2">
            Needs attention
            {list.data && <StatusBadge tone={list.data.total ? "danger" : "success"}>{list.data.total} open</StatusBadge>}
          </span>
        }
        action={
          <Link href="/users?view=over-limit" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Review users
          </Link>
        }
      />
      <p className="px-(--card-spacing) pt-1 pb-3 text-sm text-muted-foreground">
        Failed payments and accounts over their seat limit, largest first.{" "}
        {atRisk > 0 && <span className="font-mono text-foreground tabular-nums">{wholeMoney(atRisk)}</span>}
        {atRisk > 0 && " of MRR on failed cards."}
      </p>
      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} className="mx-(--card-spacing) mb-(--card-spacing)" />
      ) : !list.data ? (
        <div className="flex flex-col gap-2 px-(--card-spacing) pb-(--card-spacing)">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : list.data.rows.length === 0 ? (
        <EmptyState icon={CheckCircle2Icon} className="mx-(--card-spacing) mb-(--card-spacing)" title="Nothing needs you" description="Every card went through and every account is within its seats." />
      ) : (
        <ul className="flex flex-col border-t">
          {list.data.rows.map((account) => {
            const pastDue = account.status === "past_due"
            const pending = (pastDue ? retry : raise).isPending && (pastDue ? retry : raise).variables?.id === account.id
            const contact = contacts.get(account.id)
            return (
              <li key={account.id} className="flex items-center gap-3 border-b px-(--card-spacing) py-3 last:border-b-0">
                <PersonAvatar name={contact?.name ?? account.name} customer className="size-9" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/users?account=${account.id}`} className="truncate text-sm font-medium hover:underline">
                    {account.name}
                  </Link>
                  <span className="truncate text-xs text-muted-foreground">
                    {contact && <span className="text-foreground/80">{contact.name}</span>}
                    {contact && " · "}
                    {PLANS[account.plan].name} plan · {account.industry}
                  </span>
                </div>
                <div className="hidden lg:block">
                  {pastDue ? <StatusBadge tone="danger">Payment failed</StatusBadge> : <StatusBadge tone="warning">Over seat limit</StatusBadge>}
                </div>
                <div className="hidden w-24 text-end font-mono text-sm tabular-nums md:block">
                  {pastDue ? (
                    wholeMoney(account.mrrCents)
                  ) : (
                    <>
                      <span className="text-destructive">{account.seats}</span>
                      <span className="text-muted-foreground"> / {account.seatLimit}</span>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm" disabled={pending} onClick={() => (pastDue ? retry : raise).mutate(account)} className="w-28 shrink-0">
                  {pastDue ? "Retry card" : "Raise limit"}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Product usage
// ---------------------------------------------------------------------------

function UsageWidget() {
  const total = sum(USAGE.flat())
  const weekday = sum(USAGE.slice(0, 5).flat())
  const cells = USAGE.flatMap((row, y) => row.map((value, x) => ({ x, y, value })))
  const peak = cells.reduce((best, cell) => (cell.value > best.value ? cell : best))
  return (
    <Widget>
      <WidgetHeader title="Product usage" icon={LayersIcon} />
      <WidgetValue value={formatNumber(total * 100, { compact: true })} delta={null} caption="sessions, week of 12 Oct" />
      <Heatmap rows={USAGE_DAYS} columns={USAGE_HOURS} values={USAGE} format={(value) => `${formatNumber(value * 100)} sessions`} label="Sessions by weekday and two-hour block" className="max-w-2xl px-(--card-spacing)" />
      <dl className="grid grid-cols-2 gap-3 px-(--card-spacing) text-xs">
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">Busiest</dt>
          <dd className="font-mono tabular-nums">
            {USAGE_DAYS[peak.y]} {USAGE_HOURS[peak.x]}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">On weekdays</dt>
          <dd className="font-mono tabular-nums">{formatPercent(weekday / total)}</dd>
        </div>
      </dl>
    </Widget>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function OverviewPage() {
  const greeting = useGreeting()
  const metrics = useMemo(() => overviewMetrics(workspace(), DATA_NOW), [])
  const exportReport = () =>
    downloadCsv(
      "chronicle-overview.csv",
      ["Metric", "Value"],
      [
        ["MRR (USD)", (metrics.mrr.now / 100).toFixed(2)],
        ["Paying accounts", metrics.accounts.paying],
        ["Net revenue retention", metrics.retention.net.toFixed(4)],
        ["Active users", metrics.users.active],
        ...metrics.plans.map((row) => [`MRR ${row.name} (USD)`, (row.mrrCents / 100).toFixed(2)] as [string, string]),
      ]
    )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        // The greeting and two buttons share a row only when there is room for both.
        className="sm:flex-col sm:items-start lg:flex-row lg:items-end"
        title={`${greeting}, Maya`}
        description={
          <>
            Tuesday, 20 October 2026 · <span className="font-mono tabular-nums">{formatNumber(metrics.users.active)}</span> active users across{" "}
            <span className="font-mono tabular-nums">{formatNumber(metrics.accounts.paying)}</span> paying accounts
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={exportReport}>
              <DownloadIcon data-icon="inline-start" />
              Download report
            </Button>
            <Link href="/users" className={buttonVariants()}>
              <UsersIcon data-icon="inline-start" />
              Open users
            </Link>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <MrrWidget metrics={metrics} />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <SignupsWidget />
          <RetentionWidget metrics={metrics} />
        </div>
      </div>
      {/* Four small cards: two by two until there is room for a row of four, so none is ever left alone. */}
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <AccountsWidget metrics={metrics} />
        <TrialsWidget metrics={metrics} />
        <UsersWidget metrics={metrics} />
        <SeatsWidget metrics={metrics} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <AttentionWidget />
        <UsageWidget />
      </div>
    </div>
  )
}
