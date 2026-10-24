"use client"

import { BanIcon, DownloadIcon, MailIcon, MoreHorizontalIcon, SearchIcon, ShieldIcon, Trash2Icon, UserPlusIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"
import { PLANS } from "@/data/generate"
import type { Account, User, UserRole } from "@/data/schema"
import { ColumnMenu } from "@/kit/data-table/column-menu"
import { DataTable, type DataColumn } from "@/kit/data-table/data-table"
import { FacetedFilter } from "@/kit/data-table/faceted-filter"
import { DataTablePagination } from "@/kit/data-table/pagination"
import { ViewTabs } from "@/kit/data-table/view-tabs"
import { downloadCsv } from "@/kit/data/csv"
import { formatNumber, formatRelative } from "@/kit/data/format"
import { useKitMutation, useList } from "@/kit/data/hooks"
import { useListState } from "@/kit/data/url-state"
import { BulkActionBar } from "@/kit/ui-patterns/bulk-action-bar"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { EmptyState, ErrorState } from "@/kit/ui-patterns/query-state"
import { DATA_NOW } from "@/lib/clock"
import { adapter, type Resources } from "@/lib/data"

import { InviteDialog } from "./invite-dialog"
import { UserSheet } from "./user-sheet"
import { Initials, PlanBadge, ROLE_LABELS, RoleSelect, SeatMeter, StatusPill } from "./user-parts"

const FILTERS = ["role", "status", "plan", "account", "view"] as const

const VIEWS = [
  { value: "all", label: "All users" },
  { value: "admins", label: "Admins" },
  { value: "invited", label: "Invited" },
  { value: "suspended", label: "Suspended" },
  { value: "over-limit", label: "Over seat limit" },
]

const VIEW_DESCRIPTIONS: Record<string, string> = {
  all: "people across every customer account",
  admins: "owners and admins who can manage their account",
  invited: "invited and not signed in yet",
  suspended: "suspended and unable to sign in",
  "over-limit": "people in accounts using more seats than they pay for",
}

type Filters = Record<(typeof FILTERS)[number], string[]>

/** Which built-in view the current filters are, or "all" for anything custom. */
function currentView(filters: Filters): string {
  const only = (key: keyof Filters, values: string[]) =>
    FILTERS.every((other) => (other === key ? filters[other].length === values.length && values.every((value) => filters[other].includes(value)) : filters[other].length === 0))
  if (only("view", ["over-limit"])) return "over-limit"
  if (only("role", ["owner", "admin"])) return "admins"
  if (only("status", ["invited"])) return "invited"
  if (only("status", ["suspended"])) return "suspended"
  return "all"
}

const VIEW_FILTERS: Record<string, Partial<Filters>> = {
  all: {},
  admins: { role: ["owner", "admin"] },
  invited: { status: ["invited"] },
  suspended: { status: ["suspended"] },
  "over-limit": { view: ["over-limit"] },
}

export function UsersPage() {
  const params = useSearchParams()
  const list = useListState({ filters: FILTERS, defaultSort: "-lastSeenAt" })
  const [selection, setSelection] = useState<string[]>([])
  const [hidden, setHidden] = useState<string[]>(["createdAt"])
  const [open, setOpen] = useState<string | null>(null)
  const [inviting, setInviting] = useState(params.get("invite") === "1")

  // Every account, to show seats beside each user and to resolve the "over seat limit" view.
  const accounts = useList<Resources, "accounts">("accounts", { pageSize: 100_000 })
  const accountById = useMemo(() => new Map((accounts.data?.rows ?? []).map((account) => [account.id, account])), [accounts.data])
  const overLimitIds = useMemo(() => (accounts.data?.rows ?? []).filter((account) => account.seats > account.seatLimit).map((account) => account.id), [accounts.data])

  const overLimitView = list.filters.view.includes("over-limit")
  const query = useMemo(() => {
    const { view: _view, ...rest } = list.query.filters ?? {}
    void _view
    // The view is not a column: it narrows to the accounts that are over their limit right now.
    const account = overLimitView ? (list.filters.account.length ? list.filters.account.filter((id) => overLimitIds.includes(id)) : overLimitIds) : rest.account
    return { ...list.query, filters: { ...rest, account: overLimitView && account?.length === 0 ? ["none"] : account } }
  }, [list.query, list.filters.account, overLimitView, overLimitIds])

  const users = useList<Resources, "users">("users", query)
  const waiting = users.isPending || (overLimitView && accounts.isPending)

  const setRole = useKitMutation((input: { ids: string[]; role: UserRole }) => adapter.action<{ changed: number }>("users", "setRole", input), {
    success: (output, input) => ({ title: `${output.changed} ${output.changed === 1 ? "user is" : "users are"} now ${ROLE_LABELS[input.role].toLowerCase()}s`, description: output.changed < input.ids.length ? "Owners keep their role." : undefined }),
    error: "Could not change roles",
    invalidate: ["users"],
  })
  const suspend = useKitMutation((ids: string[]) => Promise.all(ids.map((id) => adapter.update("users", id, { status: "suspended" }))), {
    success: (rows) => ({ title: `Suspended ${rows.length} ${rows.length === 1 ? "user" : "users"}`, description: "They can no longer sign in." }),
    error: "Could not suspend",
    invalidate: ["users"],
  })
  const restore = useKitMutation((rows: User[]) => Promise.all(rows.map((row) => adapter.create("users", row))), { invalidate: ["users"] })
  const remove = useKitMutation(
    async (ids: string[]) => {
      // Read each user from the adapter, not the visible page: a selection can span pages.
      const rows = (await Promise.all(ids.map((id) => adapter.get("users", id)))).filter((row) => row.role !== "owner")
      await Promise.all(rows.map((row) => adapter.remove("users", row.id)))
      return rows
    },
    { error: "Could not remove", invalidate: ["users"] }
  )

  const removeUsers = (ids: string[]) => {
    if (remove.isPending) {
      return
    }
    remove.mutate(ids, {
      onSuccess: (rows) => {
        setSelection([])
        toast.add(
          rows.length === 0
            ? { type: "error", title: "Owners cannot be removed", description: "Transfer ownership first." }
            : { type: "success", title: `Removed ${rows.length} ${rows.length === 1 ? "user" : "users"}`, actionProps: { children: "Undo", onClick: () => restore.mutate(rows) } }
        )
      },
    })
  }

  const exportCsv = async (ids?: string[]) => {
    const all = await adapter.list("users", { ...query, page: 1, pageSize: 100_000 })
    const rows = ids ? all.rows.filter((row) => ids.includes(row.id)) : all.rows
    downloadCsv(
      "tidewell-users.csv",
      ["Name", "Email", "Account", "Role", "Plan", "Status", "Created", "Last active"],
      rows.map((row) => [row.name, row.email, row.accountName, ROLE_LABELS[row.role], PLANS[row.plan].name, row.status, row.createdAt, row.lastSeenAt])
    )
    toast.add({ type: "success", title: `Exported ${formatNumber(rows.length)} ${rows.length === 1 ? "user" : "users"}` })
  }

  const columns = useMemo<DataColumn<User>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        sortId: "name",
        hideable: false,
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-3">
            <Initials name={row.name} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{row.name}</span>
              <span className="truncate text-xs text-muted-foreground">{row.email}</span>
            </div>
          </div>
        ),
      },
      {
        id: "account",
        header: "Account",
        sortId: "accountName",
        cell: (row) => (
          <Link href={`/users?account=${row.accountId}`} onClick={(event) => event.stopPropagation()} className="truncate hover:underline">
            {row.accountName}
          </Link>
        ),
      },
      {
        id: "role",
        header: "Role",
        sortId: "role",
        className: "w-36",
        cell: (row) => <RoleSelect user={row} onChange={(role) => setRole.mutate({ ids: [row.id], role })} />,
      },
      { id: "plan", header: "Plan", className: "w-24", cell: (row) => <PlanBadge plan={row.plan} /> },
      { id: "status", header: "Status", className: "w-28", cell: (row) => <StatusPill status={row.status} /> },
      {
        id: "seats",
        header: "Seats",
        className: "w-32",
        cell: (row) => {
          const account = accountById.get(row.accountId)
          return account ? <SeatMeter account={account} /> : null
        },
      },
      {
        id: "lastSeenAt",
        header: "Last active",
        sortId: "lastSeenAt",
        sortDescFirst: true,
        className: "w-32",
        cell: (row) => <span className="text-muted-foreground">{row.lastSeenAt ? formatRelative(row.lastSeenAt, DATA_NOW) : "Never"}</span>,
      },
      {
        id: "createdAt",
        header: "Joined",
        sortId: "createdAt",
        sortDescFirst: true,
        className: "w-32",
        cell: (row) => <span className="text-muted-foreground">{formatRelative(row.createdAt, DATA_NOW)}</span>,
      },
      {
        id: "actions",
        // Named for screen readers; the heading text is transparent so the column stays a quiet icon column.
        header: "Actions",
        hideable: false,
        className: "w-16 [th&]:text-transparent",
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`} onClick={(event) => event.stopPropagation()} />}>
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setOpen(row.id)}>
                  <UsersIcon />
                  Open profile
                </DropdownMenuItem>
                {row.status === "invited" && (
                  <DropdownMenuItem
                    onClick={() =>
                      adapter.action<{ email: string }>("users", "resendInvite", { id: row.id }).then((result) => toast.add({ type: "success", title: "Invitation sent again", description: result.email }))
                    }
                  >
                    <MailIcon />
                    Resend invitation
                  </DropdownMenuItem>
                )}
                {row.status !== "suspended" && row.role !== "owner" && (
                  <DropdownMenuItem onClick={() => suspend.mutate([row.id])}>
                    <BanIcon />
                    Suspend
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              {row.role !== "owner" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onClick={() => removeUsers([row.id])}>
                      <Trash2Icon />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    // The mutations are stable objects from TanStack; the table only needs to rebuild when seats change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountById]
  )

  const view = currentView(list.filters)
  const filtered = list.activeFilterCount > 0
  const accountFilterName = list.filters.account.length === 1 ? accountById.get(list.filters.account[0])?.name : undefined

  return (
    <>
      <PageHeader
        title="Users"
        description={
          users.data ? (
            <>
              <span className="font-mono tabular-nums">{formatNumber(users.data.total)}</span> {VIEW_DESCRIPTIONS[view] && view !== "all" ? VIEW_DESCRIPTIONS[view] : filtered ? "matching" : VIEW_DESCRIPTIONS.all}
            </>
          ) : (
            "Everyone who can sign in to a customer account."
          )
        }
        actions={
          <>
            <Button variant="outline" onClick={() => exportCsv()} disabled={waiting}>
              <DownloadIcon data-icon="inline-start" />
              Export
            </Button>
            <Button onClick={() => setInviting(true)}>
              <UserPlusIcon data-icon="inline-start" />
              Invite user
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-3">
        <ViewTabs
          list="users"
          views={VIEWS}
          current={view}
          onViewChange={(value) => {
            setSelection([])
            list.applySnapshot({ search: "", sort: list.snapshot.sort, filters: { role: [], status: [], plan: [], account: [], view: [], ...VIEW_FILTERS[value] } })
          }}
          snapshot={list.snapshot}
          onApply={(snapshot) => {
            setSelection([])
            list.applySnapshot(snapshot)
          }}
          canSave={filtered && view === "all"}
        />
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search users" placeholder="Name, email or account" value={list.searchInput} onChange={(event) => list.setSearch(event.target.value)} />
          </InputGroup>
          <FacetedFilter
            title="Role"
            value={list.filters.role}
            onChange={(value) => list.setFilter("role", value)}
            options={(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
          />
          <FacetedFilter
            title="Status"
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
            options={[
              { value: "active", label: "Active" },
              { value: "invited", label: "Invited" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
          <FacetedFilter
            title="Plan"
            value={list.filters.plan}
            onChange={(value) => list.setFilter("plan", value)}
            options={Object.values(PLANS).map((plan) => ({ value: plan.id, label: plan.name }))}
          />
          {accountFilterName && (
            <Button variant="secondary" size="sm" onClick={() => list.setFilter("account", [])} aria-label={`Remove the account filter ${accountFilterName}`}>
              {accountFilterName}
              <span aria-hidden>×</span>
            </Button>
          )}
          {filtered && view === "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelection([])
                list.clearFilters()
              }}
            >
              Reset
            </Button>
          )}
          <div className="ms-auto hidden md:block">
            <ColumnMenu columns={columns} hidden={hidden} onHiddenChange={setHidden} />
          </div>
        </div>
      </div>

      {users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : (
        <div className="flex flex-col gap-3">
          <DataTable
            label="Users"
            columns={columns}
            rows={waiting ? undefined : users.data?.rows}
            getRowId={(row) => row.id}
            loading={waiting}
            sort={list.sort}
            onSortChange={list.setSort}
            selection={selection}
            onSelectionChange={setSelection}
            hiddenColumns={hidden}
            onHiddenColumnsChange={setHidden}
            onRowClick={(row) => setOpen(row.id)}
            renderMobileRow={(row, state) => (
              <div role="listitem" className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <Checkbox aria-label={`Select ${row.name}`} checked={state.selected} onCheckedChange={state.toggle} />
                <Initials name={row.name} />
                <button type="button" className="flex min-w-0 flex-1 flex-col text-start" onClick={() => setOpen(row.id)}>
                  <span className="truncate font-medium">{row.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[row.role]} · {row.accountName}
                  </span>
                </button>
                <StatusPill status={row.status} />
              </div>
            )}
            empty={
              <EmptyState
                icon={UsersIcon}
                className="border bg-card"
                title={filtered ? "No users match" : "No users yet"}
                description={filtered ? "Try another view, or clear the search and filters." : "Invite someone to get started."}
              />
            }
          />
          {users.data && users.data.total > 0 && !waiting && (
            <DataTablePagination
              page={users.data.page}
              pageSize={users.data.pageSize}
              total={users.data.total}
              pageCount={users.data.pageCount}
              onPageChange={list.setPage}
              onPageSizeChange={list.setPageSize}
              selectedCount={selection.length}
            />
          )}
        </div>
      )}

      <BulkActionBar count={selection.length} onClear={() => setSelection([])}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <ShieldIcon data-icon="inline-start" />
            Change role
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="min-w-40">
            <DropdownMenuGroup>
              {(["admin", "member", "viewer"] as const).map((role) => (
                <DropdownMenuItem key={role} onClick={() => setRole.mutate({ ids: selection, role }, { onSettled: () => setSelection([]) })}>
                  {ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={() => exportCsv(selection)}>
          <DownloadIcon data-icon="inline-start" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => removeUsers(selection)} className="text-destructive">
          <Trash2Icon data-icon="inline-start" />
          Remove
        </Button>
      </BulkActionBar>

      <UserSheet id={open} onOpenChange={(next) => !next && setOpen(null)} account={open ? accountById.get((users.data?.rows ?? []).find((row) => row.id === open)?.accountId ?? "") : undefined} />
      <InviteDialog open={inviting} onOpenChange={setInviting} accounts={accounts.data?.rows ?? []} />
    </>
  )
}

export type { Account }
