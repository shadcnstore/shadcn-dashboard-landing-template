"use client"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PLANS } from "@/data/generate"
import type { Account, PlanId, User, UserRole, UserStatus } from "@/data/schema"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { cn } from "@/lib/utils"

export const ROLE_LABELS: Record<UserRole, string> = { owner: "Owner", admin: "Admin", member: "Member", viewer: "Viewer" }
const EDITABLE_ROLES = { admin: "Admin", member: "Member", viewer: "Viewer" }

/** Two letters on a quiet tile. No photos of real people anywhere in the template. */
export function Initials({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
  return (
    <span aria-hidden className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground", className)}>
      {letters}
    </span>
  )
}

export function PlanBadge({ plan }: { plan: PlanId }) {
  return (
    <Badge variant="outline" className="font-normal">
      {PLANS[plan].name}
    </Badge>
  )
}

const STATUS: Record<UserStatus, { tone: "success" | "info" | "muted"; label: string }> = {
  active: { tone: "success", label: "Active" },
  invited: { tone: "info", label: "Invited" },
  suspended: { tone: "muted", label: "Suspended" },
}

export function StatusPill({ status }: { status: UserStatus }) {
  return <StatusBadge tone={STATUS[status].tone}>{STATUS[status].label}</StatusBadge>
}

/** Seats used of seats paid; red with a dot when the account uses more than it pays for. */
export function SeatMeter({ account }: { account: Pick<Account, "seats" | "seatLimit"> }) {
  const over = account.seats > account.seatLimit
  return (
    <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
      {over && <span className="size-1.5 rounded-full bg-destructive" aria-hidden />}
      <span className={cn(over ? "text-destructive" : "text-muted-foreground")}>
        {account.seats}/{account.seatLimit}
      </span>
      {over && <span className="sr-only">over the seat limit</span>}
    </span>
  )
}

/** The role, editable in place except for the account owner. */
export function RoleSelect({ user, onChange }: { user: User; onChange: (role: UserRole) => void }) {
  if (user.role === "owner") {
    return <span className="px-2 text-sm">Owner</span>
  }
  return (
    // The cell sits in a clickable row: keep clicks on the control from opening the record.
    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <Select value={user.role} onValueChange={(value) => value && value !== user.role && onChange(value as UserRole)} items={EDITABLE_ROLES}>
        <SelectTrigger size="sm" aria-label={`Role of ${user.name}`} className="h-7 w-28 border-transparent bg-transparent shadow-none hover:border-input">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(EDITABLE_ROLES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
