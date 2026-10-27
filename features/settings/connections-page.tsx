"use client"

import {
  BarChart2Icon,
  CalendarDaysIcon,
  CopyIcon,
  CreditCardIcon,
  DatabaseIcon,
  HeadsetIcon,
  HandshakeIcon,
  MessagesSquareIcon,
  PlugIcon,
  WebhookIcon,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { HeroFigure, HeroTitle, SettingsCard, SettingsHero } from "@/kit/settings/section"
import { IconTile, type TileTone } from "@/kit/ui-patterns/icon-tile"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"

import { FIT_HERO, SETTINGS_PAGE } from "./fit-hero"

interface Connection {
  id: string
  name: string
  /** What it does for Tidewell, in one line. */
  purpose: string
  icon: React.ComponentType<{ className?: string }>
  tone: TileTone
  group: "Revenue data" | "Where alerts go" | "Customer context"
  /** When it last synced; null when it is not connected. */
  synced: string | null
}

/**
 * The tools Tidewell reads from and writes to. Names are generic on purpose:
 * swap in your own providers and wire Connect to their OAuth flow.
 */
const CONNECTIONS: Connection[] = [
  { id: "billing", name: "Billing provider", purpose: "Subscriptions, invoices and failed payments. Every MRR figure starts here.", icon: CreditCardIcon, tone: "lead", group: "Revenue data", synced: "4 min ago" },
  { id: "warehouse", name: "Data warehouse", purpose: "A nightly copy of accounts, users and MRR movement for your own queries.", icon: DatabaseIcon, tone: "two", group: "Revenue data", synced: "Today, 02:00" },
  { id: "chat", name: "Team chat", purpose: "Failed payments and churn posted to the revenue channel as they happen.", icon: MessagesSquareIcon, tone: "three", group: "Where alerts go", synced: "12 min ago" },
  { id: "calendar", name: "Calendar", purpose: "Renewal calls and QBRs on the Calendar page, both ways.", icon: CalendarDaysIcon, tone: "info", group: "Where alerts go", synced: "1 hour ago" },
  { id: "crm", name: "CRM", purpose: "Account health and seat usage on each deal record, so sales sees risk early.", icon: HandshakeIcon, tone: "success", group: "Customer context", synced: null },
  { id: "product", name: "Product analytics", purpose: "Weekly active seats per account, for the usage heatmap and health score.", icon: BarChart2Icon, tone: "warning", group: "Customer context", synced: null },
  { id: "support", name: "Support desk", purpose: "Open tickets beside each user, and a note when a payment fails.", icon: HeadsetIcon, tone: "muted", group: "Customer context", synced: null },
]

const GROUPS = ["Revenue data", "Where alerts go", "Customer context"] as const

const WEBHOOKS = [
  { url: "https://hooks.example.com/tidewell/revenue", events: "payment_failed, churn", status: "Delivering", last: "200 OK, 9 min ago" },
  { url: "https://ops.example.com/webhooks/seats", events: "seat_limit_exceeded", status: "Delivering", last: "200 OK, 2 hours ago" },
]

function ConnectionRow({ connection, connected, onToggle }: { connection: Connection; connected: boolean; onToggle: () => void }) {
  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <IconTile icon={connection.icon} tone={connection.tone} size="sm" className="mt-0.5" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{connection.name}</span>
            {connected ? <StatusBadge tone="success">Connected</StatusBadge> : <StatusBadge tone="muted">Not connected</StatusBadge>}
          </div>
          <p className="text-sm text-muted-foreground">{connection.purpose}</p>
          {connected && connection.synced && <p className="text-xs text-muted-foreground">Last sync {connection.synced}</p>}
        </div>
      </div>
      <Button variant={connected ? "outline" : "default"} size="sm" className="w-full shrink-0 sm:w-28" onClick={onToggle}>
        {connected ? "Disconnect" : "Connect"}
      </Button>
    </li>
  )
}

export function ConnectionsSettingsPage() {
  const [connected, setConnected] = useState<Set<string>>(() => new Set(CONNECTIONS.filter((connection) => connection.synced).map((connection) => connection.id)))
  const count = connected.size

  const toggle = (connection: Connection) => {
    const next = new Set(connected)
    const on = !next.has(connection.id)
    if (on) {
      next.add(connection.id)
    } else {
      next.delete(connection.id)
    }
    setConnected(next)
    toast.add({
      type: "success",
      title: on ? `${connection.name} connected` : `${connection.name} disconnected`,
      description: on ? "The first sync runs in the background." : "Nothing new comes in until you connect it again.",
    })
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.add({ type: "success", title: "Endpoint copied" })
    } catch {
      toast.add({ type: "error", title: "Could not copy", description: url })
    }
  }

  return (
    <div className={SETTINGS_PAGE}>
      <SettingsHero
        className={FIT_HERO}
        aside={
          <ul className="flex flex-col gap-2.5 text-sm" aria-label="Last syncs">
            {CONNECTIONS.filter((connection) => connected.has(connection.id)).map((connection) => (
              <li key={connection.id} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                  <span className="truncate">{connection.name}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{connection.synced ?? "Syncing"}</span>
              </li>
            ))}
            {count === 0 && <li className="text-muted-foreground">Nothing is connected.</li>}
          </ul>
        }
      >
        <HeroTitle icon={PlugIcon} label="Connections" title={count === CONNECTIONS.length ? "Everything is connected" : `${CONNECTIONS.length - count} available to add`} />
        <HeroFigure value={count} unit={` / ${CONNECTIONS.length}`} />
        <p className="text-sm text-muted-foreground">Tools Tidewell reads revenue from and sends alerts to. The billing provider is the one every number depends on.</p>
      </SettingsHero>

      {GROUPS.map((group) => (
        <SettingsCard key={group} title={group} description={group === "Revenue data" ? "Where MRR, accounts and seats come from." : group === "Where alerts go" ? "Where the team hears about payments and renewals." : "Context that sits beside each account and user."}>
          <ul className="flex flex-col divide-y">
            {CONNECTIONS.filter((connection) => connection.group === group).map((connection) => (
              <ConnectionRow key={connection.id} connection={connection} connected={connected.has(connection.id)} onToggle={() => toggle(connection)} />
            ))}
          </ul>
        </SettingsCard>
      ))}

      <SettingsCard icon={WebhookIcon} title="Webhooks" description="Tidewell posts these events to your endpoints, signed with your workspace secret.">
        <ul className="flex flex-col divide-y">
          {WEBHOOKS.map((hook) => (
            <li key={hook.url} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-mono text-xs">{hook.url}</span>
                <span className="text-xs text-muted-foreground">
                  {hook.events} · {hook.last}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone="success">{hook.status}</StatusBadge>
                <Button variant="ghost" size="icon-sm" aria-label={`Copy ${hook.url}`} onClick={() => void copy(hook.url)}>
                  <CopyIcon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </SettingsCard>
    </div>
  )
}
