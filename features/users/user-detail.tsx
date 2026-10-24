"use client"

import { BanIcon, CalendarIcon, ClockIcon, MailIcon, RotateCcwIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PLANS } from "@/data/generate"
import type { Account, UserRole } from "@/data/schema"
import { formatDate, formatMoney, formatRelative } from "@/kit/data/format"
import { useKitMutation, useRecord } from "@/kit/data/hooks"
import { ErrorState } from "@/kit/ui-patterns/query-state"
import { DATA_NOW } from "@/lib/clock"
import { adapter, type Resources } from "@/lib/data"

import { Initials, PlanBadge, RoleSelect, ROLE_LABELS, SeatMeter, StatusPill } from "./user-parts"

/** One user and their account: used by the side sheet and by the /users/[id] page. */
export function UserDetail({ id, account: known }: { id: string; account?: Account }) {
  const user = useRecord<Resources, "users">("users", id)
  const fetched = useRecord<Resources, "accounts">("accounts", known ? null : (user.data?.accountId ?? null))
  const account = known ?? fetched.data

  const update = useKitMutation((patch: { role?: UserRole; status?: "active" | "suspended" }) => adapter.update("users", id, patch), {
    success: (row) => ({ title: `${row.name} updated`, description: `${ROLE_LABELS[row.role]}, ${row.status}` }),
    error: "Could not save",
    invalidate: ["users"],
  })

  if (user.isError) {
    return <ErrorState error={user.error} onRetry={() => user.refetch()} />
  }
  if (!user.data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  const row = user.data
  const facts = [
    { icon: MailIcon, label: "Email", value: <a href={`mailto:${row.email}`} className="hover:underline">{row.email}</a> },
    { icon: CalendarIcon, label: "Joined", value: formatDate(row.createdAt) },
    { icon: ClockIcon, label: "Last active", value: row.lastSeenAt ? formatRelative(row.lastSeenAt, DATA_NOW) : "Has not signed in yet" },
  ]
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Initials name={row.name} className="size-12 text-base" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-lg font-semibold">{row.name}</span>
          <span className="flex items-center gap-2">
            <StatusPill status={row.status} />
            <PlanBadge plan={row.plan} />
          </span>
        </div>
      </div>
      <dl className="grid gap-3 text-sm">
        {facts.map((fact) => (
          <div key={fact.label} className="grid grid-cols-[7rem_1fr] items-center gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <fact.icon className="size-4" />
              {fact.label}
            </dt>
            <dd className="min-w-0 truncate">{fact.value}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[7rem_1fr] items-center gap-3">
          <dt className="text-muted-foreground">Role</dt>
          <dd>
            <RoleSelect user={row} onChange={(role) => update.mutate({ role })} />
          </dd>
        </div>
      </dl>
      <Separator />
      {account && (
        <section aria-labelledby="account-heading" className="flex flex-col gap-3">
          <h3 id="account-heading" className="text-sm font-medium">
            Account
          </h3>
          <div className="grid gap-2 rounded-xl bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/users?account=${account.id}`} className="font-medium hover:underline">
                {account.name}
              </Link>
              <span className="font-mono tabular-nums">{formatMoney(account.mrrCents)}/mo</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-muted-foreground">
              <span>
                {PLANS[account.plan].name} · {account.industry} · {account.region}
              </span>
              <SeatMeter account={account} />
            </div>
          </div>
        </section>
      )}
      {row.role !== "owner" && (
        <div className="flex flex-wrap gap-2">
          {row.status === "suspended" ? (
            <Button variant="outline" size="sm" onClick={() => update.mutate({ status: "active" })} disabled={update.isPending}>
              <RotateCcwIcon data-icon="inline-start" />
              Reactivate
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => update.mutate({ status: "suspended" })} disabled={update.isPending}>
              <BanIcon data-icon="inline-start" />
              Suspend
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
