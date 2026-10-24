"use client"

import {
  BadgeDollarSignIcon,
  BellIcon,
  BellRingIcon,
  CheckSquareIcon,
  MailIcon,
  MoonIcon,
  ShieldAlertIcon,
  SmartphoneIcon,
} from "lucide-react"
import { useState } from "react"

import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { useDraft } from "@/kit/settings/use-draft"
import {
  HeroFigure,
  HeroTitle,
  SettingsCard,
  SettingsHero,
  ToggleRow,
} from "@/kit/settings/section"
import type { TileTone } from "@/kit/ui-patterns/icon-tile"
import { SaveBar } from "@/kit/ui-patterns/save-bar"
import { cn } from "@/lib/utils"

import {
  DEFAULT_PREFS,
  useSettingsStore,
  type AlertKind,
  type Channel,
  type NotificationPrefs,
} from "./stores"

const CHANNELS: {
  id: Channel
  label: string
  short: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone: TileTone
}[] = [
  {
    id: "email",
    label: "Email",
    short: "Email",
    description:
      "To maya.okafor@example.com. Good for things that can wait an hour.",
    icon: MailIcon,
    tone: "lead",
  },
  {
    id: "inApp",
    label: "In the app",
    short: "In app",
    description: "The bell in the header and the Notifications page.",
    icon: BellIcon,
    tone: "two",
  },
  {
    id: "mobile",
    label: "Mobile push",
    short: "Push",
    description: "On your phone. Keep it for what needs you now.",
    icon: SmartphoneIcon,
    tone: "three",
  },
]

const GROUPS: {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone: TileTone
  alerts: { id: AlertKind; label: string; description: string }[]
}[] = [
  {
    id: "revenue",
    title: "Revenue",
    description: "Money coming in and going up.",
    icon: BadgeDollarSignIcon,
    tone: "lead",
    alerts: [
      {
        id: "newPaying",
        label: "New paying account",
        description:
          "A trial converts or a new account pays its first invoice.",
      },
      {
        id: "expansion",
        label: "Seats added",
        description: "An account upgrades or buys more seats.",
      },
      {
        id: "contraction",
        label: "Seats removed",
        description: "An account lowers its seat count.",
      },
    ],
  },
  {
    id: "risk",
    title: "Risk",
    description: "Revenue that needs someone to act.",
    icon: ShieldAlertIcon,
    tone: "danger",
    alerts: [
      {
        id: "paymentFailed",
        label: "Payment failed",
        description: "A card is declined; retries run for seven days.",
      },
      {
        id: "churn",
        label: "Cancellation",
        description: "An owner cancels their subscription.",
      },
      {
        id: "seatLimit",
        label: "Over seat limit",
        description: "An account has more active users than seats.",
      },
    ],
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Your own work in Chronicle.",
    icon: CheckSquareIcon,
    tone: "success",
    alerts: [
      {
        id: "taskAssigned",
        label: "Task assigned to you",
        description: "Someone gives you a task or mentions you on one.",
      },
      {
        id: "weeklyDigest",
        label: "Weekly digest",
        description: "Monday morning: MRR, churn and what is due this week.",
      },
    ],
  },
]

const KINDS = GROUPS.flatMap((group) => group.alerts.map((alert) => alert.id))

export function NotificationSettingsPage() {
  const saved = useSettingsStore((state) => state.notifications)
  const save = useSettingsStore((state) => state.saveNotifications)
  const { draft, setDraft, dirty, reset } = useDraft<NotificationPrefs>(saved)
  const [saving, setSaving] = useState(false)
  if (!draft) {
    return null
  }

  const onCount = (channel: Channel) =>
    KINDS.filter((kind) => draft.channels[channel][kind]).length
  const total = CHANNELS.reduce(
    (count, channel) => count + onCount(channel.id),
    0
  )
  const setAlert = (channel: Channel, kind: AlertKind, value: boolean) =>
    setDraft((state) => ({
      ...state,
      channels: {
        ...state.channels,
        [channel]: { ...state.channels[channel], [kind]: value },
      },
    }))
  // Switching a channel off silences every alert on it; switching it back on restores the recommended set.
  const setChannel = (channel: Channel, value: boolean) =>
    setDraft((state) => ({
      ...state,
      channels: {
        ...state.channels,
        [channel]: value
          ? { ...DEFAULT_PREFS.channels[channel] }
          : (Object.fromEntries(KINDS.map((kind) => [kind, false])) as Record<
              AlertKind,
              boolean
            >),
      },
    }))

  const onSave = async () => {
    setSaving(true)
    // Stands in for the request to your backend.
    await new Promise((resolve) => setTimeout(resolve, 450))
    save(draft)
    setSaving(false)
    toast.add({ type: "success", title: "Notification settings saved" })
  }

  return (
    <>
      <SettingsHero
        aside={
          <div className="flex flex-col gap-4">
            {CHANNELS.map((channel) => {
              const count = onCount(channel.id)
              const Icon = channel.icon
              return (
                <div key={channel.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      {channel.label}
                    </span>
                    <span className="font-mono tabular-nums">
                      {count}
                      <span className="text-muted-foreground">
                        /{KINDS.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex h-2 gap-1" aria-hidden>
                    {KINDS.map((kind) => (
                      <span
                        key={kind}
                        className={cn(
                          "flex-1 rounded-full transition-colors duration-250",
                          draft.channels[channel.id][kind]
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        }
      >
        <HeroTitle
          icon={BellRingIcon}
          label="Alerts reaching you"
          title={
            total === 0
              ? "Everything is muted"
              : `${CHANNELS.filter((channel) => onCount(channel.id) > 0).length} of ${CHANNELS.length} channels on`
          }
        />
        <HeroFigure
          value={total}
          unit={` / ${KINDS.length * CHANNELS.length}`}
        />
        <p className="text-sm text-muted-foreground">
          Alert and channel pairs switched on. Risk alerts are the ones worth a
          push.
        </p>
      </SettingsHero>

      <SettingsCard
        icon={BellIcon}
        title="Channels"
        description="Turn a whole channel off without losing the choices below."
      >
        <div className="flex flex-col gap-2">
          {CHANNELS.map((channel) => (
            <ToggleRow
              key={channel.id}
              id={`channel-${channel.id}`}
              icon={channel.icon}
              tone={channel.tone}
              title={channel.label}
              description={channel.description}
              checked={onCount(channel.id) > 0}
              onCheckedChange={(value) => setChannel(channel.id, value)}
            />
          ))}
          <ToggleRow
            id="quiet-hours"
            icon={MoonIcon}
            tone="muted"
            title="Quiet hours"
            description="Hold pushes from 10 PM to 7 AM. Payment failures still come through."
            checked={draft.quietHours}
            onCheckedChange={(quietHours) =>
              setDraft((state) => ({ ...state, quietHours }))
            }
          />
        </div>
      </SettingsCard>

      {GROUPS.map((group) => (
        <SettingsCard
          key={group.id}
          icon={group.icon}
          tone={group.tone}
          title={group.title}
          description={group.description}
        >
          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_repeat(3,3.5rem)] items-end gap-2 border-b pb-2 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_repeat(3,4.5rem)]">
              <span>Alert</span>
              {CHANNELS.map((channel) => (
                <span key={channel.id} className="text-center">
                  {channel.short}
                </span>
              ))}
            </div>
            {group.alerts.map((alert) => (
              <div
                key={alert.id}
                className="grid grid-cols-[1fr_repeat(3,3.5rem)] items-center gap-2 border-b py-3 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_repeat(3,4.5rem)]"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">{alert.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {alert.description}
                  </span>
                </div>
                {CHANNELS.map((channel) => (
                  <span key={channel.id} className="flex justify-center">
                    <Switch
                      size="sm"
                      aria-label={`${alert.label} by ${channel.label.toLowerCase()}`}
                      checked={draft.channels[channel.id][alert.id]}
                      onCheckedChange={(value) =>
                        setAlert(channel.id, alert.id, value)
                      }
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </SettingsCard>
      ))}

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={() => void onSave()}
        onDiscard={reset}
      />
    </>
  )
}
