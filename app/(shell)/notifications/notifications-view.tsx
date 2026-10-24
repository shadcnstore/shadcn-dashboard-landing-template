"use client"

import {
  BadgeDollarSignIcon,
  Settings2Icon,
  ShieldAlertIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PLANS, workspace } from "@/data/generate"
import { useNotifications } from "@/features/notifications/store"
import { formatMoney } from "@/kit/data/format"
import {
  NotificationsInbox,
  type InboxCategory,
} from "@/kit/notifications/notifications-inbox"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { Widget, WidgetHeader, WidgetValue } from "@/kit/widgets/widget"

const CATEGORIES: InboxCategory[] = [
  { id: "revenue", label: "Revenue", icon: BadgeDollarSignIcon, tone: "lead" },
  { id: "risk", label: "Risk", icon: ShieldAlertIcon, tone: "danger" },
]

/** What the alerts add up to: MRR the revenue alerts brought in, and MRR sitting on a failed card. */
function Summary() {
  const data = workspace()
  const recent = data.activity.slice(0, 24)
  const gained = recent
    .filter((entry) => entry.mrrDeltaCents > 0)
    .reduce((total, entry) => total + entry.mrrDeltaCents, 0)
  const atRisk = data.accounts
    .filter((account) => account.status === "past_due")
    .sort((a, b) => b.mrrCents - a.mrrCents)
  const riskCents = atRisk.reduce(
    (total, account) => total + account.mrrCents,
    0
  )
  return (
    <div className="flex flex-col gap-4 xl:sticky xl:top-20">
      <Widget>
        <WidgetHeader
          title="Revenue in these alerts"
          icon={BadgeDollarSignIcon}
        />
        <WidgetValue
          value={`+${formatMoney(gained, { compact: true })}`}
          caption={`MRR from ${recent.filter((entry) => entry.mrrDeltaCents > 0).length} new and expanded accounts`}
        />
      </Widget>
      <Widget>
        <WidgetHeader title="MRR on a failed card" icon={ShieldAlertIcon} />
        <WidgetValue
          value={formatMoney(riskCents, { compact: true })}
          caption={`${atRisk.length} accounts past due, retrying`}
        />
        <ul className="flex flex-col px-(--card-spacing)">
          {atRisk.slice(0, 5).map((account) => (
            <li
              key={account.id}
              className="flex items-center gap-3 border-b py-2.5 text-sm last:border-b-0"
            >
              <Link
                href={`/users?account=${account.id}`}
                className="min-w-0 flex-1 truncate font-medium hover:underline"
              >
                {account.name}
              </Link>
              <StatusBadge tone="warning">
                {PLANS[account.plan].name}
              </StatusBadge>
              <span className="w-16 text-end font-mono tabular-nums">
                {formatMoney(account.mrrCents, { compact: true })}
              </span>
            </li>
          ))}
        </ul>
      </Widget>
    </div>
  )
}

export function NotificationsView() {
  const items = useNotifications((state) => state.items)
  const markRead = useNotifications((state) => state.markRead)
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Payments, upgrades and cancellations across every Tidewell account."
        actions={
          <Button
            variant="outline"
            render={<Link href="/settings/notifications" />}
            nativeButton={false}
          >
            <Settings2Icon data-icon="inline-start" />
            Notification settings
          </Button>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-12">
        {/* Two categories, so the filter cards share the row. */}
        <div className="min-w-0 xl:col-span-8 [&_[aria-label='Filter_by_category']]:grid-cols-2">
          <NotificationsInbox
            items={items}
            categories={CATEGORIES}
            loading={false}
            onMarkRead={markRead}
          />
        </div>
        <div className="xl:col-span-4">
          <Summary />
        </div>
      </div>
    </>
  )
}
