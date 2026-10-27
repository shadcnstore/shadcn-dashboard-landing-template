"use client"

import { CheckIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, LaptopIcon, LogOutIcon, MonitorSmartphoneIcon, ShieldCheckIcon, SmartphoneIcon, TabletIcon, TriangleAlertIcon, UserIcon } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

import { StrengthMeter } from "@/kit/auth/password-strength"
import type { ShellUser } from "@/kit/shell/types"
import { IconTile } from "@/kit/ui-patterns/icon-tile"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { Widget } from "@/kit/widgets/widget"

const MIN_PASSWORD = 12

function Section({ icon, title, description, children, footer }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Widget className="gap-5">
      <div className="flex items-start gap-3 px-(--card-spacing)">
        <IconTile icon={icon} size="sm" className="mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="px-(--card-spacing)">{children}</div>
      {footer && <div className="-mb-(--card-spacing) flex justify-end border-t bg-muted/30 px-(--card-spacing) py-3">{footer}</div>}
    </Widget>
  )
}

export interface AccountSession {
  id: string
  /** Device and app, e.g. "Mac · Safari". */
  device: string
  /** Where it signed in from, e.g. "Lisbon, PT". */
  place: string
  /** When it was last active, already written out, e.g. "2 hours ago". */
  when: string
  /** The device reading this page. */
  current: boolean
  /** Picks the icon. Plain data, so a server page can pass sessions in. */
  kind: "desktop" | "phone" | "tablet"
}

const SESSION_ICONS: Record<AccountSession["kind"], React.ComponentType<{ className?: string }>> = {
  desktop: LaptopIcon,
  phone: SmartphoneIcon,
  tablet: TabletIcon,
}

const DEFAULT_SESSIONS: AccountSession[] = [
  { id: "this", device: "Mac · Safari", place: "Lisbon, PT", when: "Active now", current: true, kind: "desktop" },
  { id: "phone", device: "iPhone · Safari", place: "Lisbon, PT", when: "2 hours ago", current: false, kind: "phone" },
  { id: "office", device: "Windows · Chrome", place: "Porto, PT", when: "3 days ago", current: false, kind: "desktop" },
]

/**
 * Profile, password, two-step sign-in and signed-in devices. The Kit ships
 * the screen; wire each "save" to your auth provider (Auth.js, Clerk, Better
 * Auth). In the demo, changes show a confirmation and are not stored.
 *
 * Owned here, not in kit/: Kit 1.0.8's copy drops `user.avatar` and shows
 * initials, so the signed-in user lost the portrait every other screen shows.
 * kit.lock.json excludes `account/**`, so a Kit sync leaves this file alone.
 */
export function AccountPage({
  user,
  sessions: initialSessions = DEFAULT_SESSIONS,
  profileNote = "Your profile is how the rest of the team sees you across the app and in the activity log.",
}: {
  user: ShellUser
  /** Signed-in devices to list; the first `current` one is this device. */
  sessions?: AccountSession[]
  /** One line under the profile card about where the name shows up. */
  profileNote?: string
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [reveal, setReveal] = useState(false)
  const [twoStep, setTwoStep] = useState(true)
  const [sessions, setSessions] = useState(initialSessions)

  const passwordError =
    next && next.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters.` : confirm && confirm !== next ? "The two new passwords do not match." : null
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const others = sessions.filter((session) => !session.current).length
  const checks = [
    { label: "Two-step sign-in", ok: twoStep, detail: twoStep ? "On, with an authenticator app" : "Off. Turn it on below" },
    { label: "Signed-in devices", ok: others <= 2, detail: others === 0 ? "Only this device" : `${others} other ${others === 1 ? "device" : "devices"}` },
    { label: "Recovery email", ok: Boolean(email), detail: email || "Add an email" },
  ]
  const passed = checks.filter((check) => check.ok).length

  return (
    <>
      <Widget className="gap-0 overflow-hidden p-0 md:flex-row">
        <div className="flex flex-col gap-4 p-5 md:w-2/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-16 text-lg ring-4 ring-primary/10">
                {user.avatar && <AvatarImage src={user.avatar} alt="" />}
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 font-semibold text-primary-foreground">{initials || "?"}</AvatarFallback>
              </Avatar>
              <span className="absolute -end-0.5 -bottom-0.5 size-4 rounded-full bg-success ring-3 ring-card" title="Online" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-lg font-semibold">{name || "Your name"}</span>
              <span className="truncate text-sm text-muted-foreground">{email}</span>
              <StatusBadge tone="neutral" dot={false} className="mt-1.5 w-fit gap-1">
                <ShieldCheckIcon className="size-3" />
                Owner
              </StatusBadge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{profileNote}</p>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3 border-t bg-muted/30 p-5 md:border-s md:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Security checkup</span>
            <span className="font-mono text-sm tabular-nums">
              <span className="text-lg font-semibold">{passed}</span>
              <span className="text-muted-foreground"> / {checks.length}</span>
            </span>
          </div>
          <div className="flex gap-1" aria-hidden>
            {checks.map((check, index) => (
              <span key={check.label} className={cn("h-2 flex-1 rounded-full transition-colors duration-250", index < passed ? (passed === checks.length ? "bg-success" : "bg-warning") : "bg-muted")} />
            ))}
          </div>
          <ul className="grid gap-2 sm:grid-cols-3">
            {checks.map((check) => (
              <li key={check.label} className="flex flex-col gap-1.5 rounded-xl bg-card p-3 shadow-(--surface-shadow) ring-1 ring-foreground/5">
                <span className={cn("flex size-6 items-center justify-center rounded-full transition-colors duration-250", check.ok ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground dark:text-warning")}>
                  {check.ok ? <CheckIcon className="size-3.5" strokeWidth={3} /> : <TriangleAlertIcon className="size-3.5" />}
                </span>
                <span className="text-sm font-medium">{check.label}</span>
                <span className="truncate text-xs text-muted-foreground">{check.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </Widget>

      <Section
        icon={UserIcon}
        title="Profile"
        description="How you appear to the rest of the team."
        footer={
          <Button disabled={name === user.name && email === user.email} onClick={() => toast.add({ type: "success", title: "Profile saved" })}>
            Save profile
          </Button>
        }
      >
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="account-name">Name</FieldLabel>
            <Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="account-email">Email</FieldLabel>
            <Input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
        </FieldGroup>
      </Section>

      <Section
        icon={KeyRoundIcon}
        title="Password"
        description={`At least ${MIN_PASSWORD} characters. A short sentence is easier to remember than symbols.`}
        footer={
          <Button type="submit" form="password-form" disabled={!current || !next || !confirm || Boolean(passwordError)}>
            Change password
          </Button>
        }
      >
        <form
          id="password-form"
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!passwordError && current && next) {
              toast.add({ type: "success", title: "Password changed", description: "Other devices will be asked to sign in again." })
              setCurrent("")
              setNext("")
              setConfirm("")
            }
          }}
        >
          <FieldGroup className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="current-password">Current password</FieldLabel>
              <Input id="current-password" type={reveal ? "text" : "password"} autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} />
            </Field>
            <Field data-invalid={Boolean(passwordError) || undefined}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="new-password"
                  type={reveal ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordError) || undefined}
                  aria-describedby="password-strength"
                  value={next}
                  onChange={(event) => setNext(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label={reveal ? "Hide passwords" : "Show passwords"} aria-pressed={reveal} onClick={() => setReveal((value) => !value)}>
                    {reveal ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field data-invalid={Boolean(passwordError) || undefined}>
              <FieldLabel htmlFor="confirm-password">Repeat new password</FieldLabel>
              <Input id="confirm-password" type={reveal ? "text" : "password"} autoComplete="new-password" aria-invalid={Boolean(passwordError) || undefined} value={confirm} onChange={(event) => setConfirm(event.target.value)} />
            </Field>
          </FieldGroup>
          <StrengthMeter id="password-strength" password={next} minimum={MIN_PASSWORD} />
          {passwordError && <FieldError>{passwordError}</FieldError>}
        </form>
      </Section>

      <Section icon={ShieldCheckIcon} title="Two-step sign-in">
        <label htmlFor="two-step" className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/70">
          <IconTile icon={SmartphoneIcon} tone={twoStep ? "success" : "warning"} size="sm" className="transition-colors duration-250" />
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium">Ask for a code from an authenticator app</span>
            <span className="text-sm text-muted-foreground">{twoStep ? "On. You enter a 6-digit code after your password." : "Off. Anyone with your password can sign in."}</span>
          </span>
          <Switch
            id="two-step"
            className="mt-1"
            checked={twoStep}
            onCheckedChange={(checked) => {
              setTwoStep(checked)
              toast.add({ type: checked ? "success" : "warning", title: checked ? "Two-step sign-in is on" : "Two-step sign-in is off" })
            }}
          />
        </label>
      </Section>

      <Section
        icon={MonitorSmartphoneIcon}
        title="Signed-in devices"
        description="Sign out anything you do not recognise."
        footer={
          others > 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                setSessions((list) => list.filter((entry) => entry.current))
                toast.add({ type: "success", title: "Signed out of every other device" })
              }}
            >
              <LogOutIcon data-icon="inline-start" />
              Sign out everywhere else
            </Button>
          ) : undefined
        }
      >
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => (
            <li key={session.id} className="flex animate-rise items-center gap-3 rounded-xl bg-muted/40 p-3">
              <IconTile icon={SESSION_ICONS[session.kind]} tone={session.current ? "lead" : "muted"} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {session.device}
                  {session.current && <StatusBadge tone="success">This device</StatusBadge>}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session.place} · {session.when}
                </span>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setSessions((list) => list.filter((entry) => entry.id !== session.id))}>
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
