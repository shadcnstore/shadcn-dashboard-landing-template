"use client"

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import { IconTile, type TileTone } from "../ui-patterns/icon-tile"
import { Widget } from "../widgets/widget"

/**
 * The building blocks of every settings page: a summary hero, then a stack of
 * titled soft cards. Kit screens (team, API keys, billing, plans) use them,
 * and a template's own settings pages should too, so all of them line up.
 */

/** A titled soft card; every settings page is a stack of these under a summary. */
export function SettingsCard({
  title,
  description,
  icon,
  tone,
  action,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tone?: TileTone
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Widget className={cn("gap-5", className)}>
      <div className="flex items-start gap-3 px-(--card-spacing)">
        {icon && <IconTile icon={icon} tone={tone} size="sm" className="mt-0.5" />}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className="px-(--card-spacing)">{children}</div>
    </Widget>
  )
}

/**
 * The summary that opens a settings page: what the section looks like right
 * now, in big numbers, before any form. `aside` is the tinted right half, for
 * meters, a preview or a breakdown.
 */
export function SettingsHero({ children, aside, className }: { children: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <Widget className={cn("gap-0 overflow-hidden p-0 md:flex-row", className)}>
      <div className={cn("flex flex-col gap-4 p-5", aside && "md:w-2/5")}>{children}</div>
      {aside && <div className="flex flex-1 flex-col justify-center gap-5 border-t bg-muted/30 p-5 md:border-s md:border-t-0">{aside}</div>}
    </Widget>
  )
}

/** Icon, label and status on one line at the top of a hero. */
export function HeroTitle({ icon, tone, label, title, badge }: { icon: React.ComponentType<{ className?: string }>; tone?: TileTone; label: string; title: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <IconTile icon={icon} tone={tone} />
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="truncate font-heading text-lg font-semibold">{title}</span>
      </div>
      {badge && <div className="ms-auto">{badge}</div>}
    </div>
  )
}

/** The big monospace figure, with a small unit after it. */
export function HeroFigure({ value, unit, className }: { value: React.ReactNode; unit?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("font-mono text-4xl font-semibold tracking-tight tabular-nums", className)}>
      {value}
      {unit && <span className="text-base font-normal text-muted-foreground">{unit}</span>}
    </div>
  )
}

/**
 * A setting that is on or off, as a whole clickable row: tile, label,
 * description and the switch. The row tints while on, so a list of them reads
 * at a glance.
 */
export function ToggleRow({
  id,
  icon,
  tone = "lead",
  title,
  description,
  checked,
  onCheckedChange,
  children,
  className,
}: {
  id: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: TileTone
  title: React.ReactNode
  description?: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Shown under the description while the setting is on. */
  children?: React.ReactNode
  className?: string
}) {
  return (
    <FieldLabel htmlFor={id} className={cn("rounded-xl! border-transparent bg-muted/40 p-3 transition-colors duration-150 hover:bg-muted/70", className)}>
      <Field orientation="horizontal" className="items-start! p-0!">
        {icon && <IconTile icon={icon} tone={checked ? tone : "muted"} size="sm" className="transition-colors duration-150" />}
        <FieldContent className="min-w-0">
          <span className="font-medium">{title}</span>
          {description && <FieldDescription>{description}</FieldDescription>}
          {checked && children}
        </FieldContent>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
      </Field>
    </FieldLabel>
  )
}

export function SettingsSkeleton() {
  return (
    <>
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </>
  )
}
