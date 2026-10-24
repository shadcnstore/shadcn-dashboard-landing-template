"use client"

import { ArrowUpRightIcon, CheckIcon, MinusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { PRO, type PaidTemplate } from "./config"
import { trackFunnel } from "./track"

/** A link out to shadcnstore.com that records where it was clicked. */
export function OutLink({
  href,
  placement,
  target,
  variant = "default",
  size = "default",
  className,
  children,
}: {
  href: string
  placement: string
  target?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
  children: React.ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noopener" className={cn(buttonVariants({ variant, size }), className)} onClick={() => trackFunnel(placement, target ? { target } : {})}>
      {children}
      <ArrowUpRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
    </a>
  )
}

export function StatusBadge({ template }: { template: PaidTemplate }) {
  return template.status === "live" ? (
    <Badge variant="secondary" className="font-mono tabular-nums">
      {template.price} one-time
    </Badge>
  ) : (
    <Badge variant="outline">Coming soon · in Pro</Badge>
  )
}

/** A real screenshot of the template in a quiet browser frame. */
export function Screenshot({ template, priority = false, className }: { template: PaidTemplate; priority?: boolean; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-muted shadow-(--surface-shadow)", className)}>
      <div className="flex h-6 items-center gap-1.5 border-b bg-card px-3" aria-hidden>
        <span className="size-2 rounded-full bg-muted-foreground/30" />
        <span className="size-2 rounded-full bg-muted-foreground/30" />
        <span className="size-2 rounded-full bg-muted-foreground/30" />
      </div>
      {/* Bundled for the demo only; the template you download never shows these. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={template.image} alt={`${template.name}: ${template.pitch}`} width={1200} height={750} loading={priority ? "eager" : "lazy"} className="aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}

export function ProductCard({ template }: { template: PaidTemplate }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-4 text-card-foreground shadow-(--surface-shadow)">
      <Screenshot template={template} />
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-base font-semibold">{template.name}</h3>
          <StatusBadge template={template} />
        </div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{template.kind}</p>
        <p className="text-sm">{template.pitch}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 px-1">
        <OutLink href={template.href} placement="further-template" target={template.slug} variant={template.status === "live" ? "default" : "outline"} size="sm">
          {template.status === "live" ? `See ${template.name}` : "Read more"}
        </OutLink>
        {template.demo && (
          <OutLink href={template.demo} placement="further-demo" target={template.slug} variant="ghost" size="sm">
            Live demo
          </OutLink>
        )}
      </div>
    </article>
  )
}

/** Pro, in plain terms: one payment, what it includes, where to buy. */
export function ProBand({ className }: { className?: string }) {
  return (
    <section aria-labelledby="pro-heading" className={cn("grid gap-6 rounded-2xl bg-primary p-6 text-primary-foreground shadow-(--surface-shadow-raised) md:grid-cols-[1fr_auto] md:items-center md:p-8", className)}>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide uppercase opacity-90">Pro plan</p>
        <h2 id="pro-heading" className="font-heading text-2xl font-semibold tracking-tight">
          Every template on this page, each as it launches, for one payment.
        </h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {PRO.includes.map((line) => (
            <li key={line} className="flex gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <p className="font-mono text-4xl font-semibold tabular-nums">{PRO.price}</p>
        <p className="text-sm opacity-90">one-time, no subscription</p>
        <OutLink href={PRO.href} placement="further-pro" variant="secondary" className="mt-2">
          See Pro on the pricing page
        </OutLink>
      </div>
    </section>
  )
}

type Cell = boolean | string

const ROWS: { label: string; free: Cell; single: Cell; pro: Cell }[] = [
  { label: "Shell, customizer, ⌘K, data adapter, tables, charts", free: true, single: true, pro: true },
  { label: "A complete business: its screens and a dataset that reconciles", free: false, single: "One", pro: "All" },
  { label: "Assistant that proposes changes for your approval", free: false, single: "Dashboards", pro: true },
  { label: "Team and roles, billing and plans, API keys", free: false, single: "Dashboards", pro: true },
  { label: "Templates released later", free: false, single: false, pro: true },
  { label: "Premium blocks and the Figma UI kit", free: false, single: false, pro: true },
  { label: "Price", free: "Free, MIT", single: "From $79", pro: `${PRO.price} one-time` },
]

function Mark({ value, label }: { value: Cell; label: string }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>
  }
  return value ? <CheckIcon className="mx-auto size-4 text-success" aria-label={`${label}: yes`} /> : <MinusIcon className="mx-auto size-4 text-muted-foreground" aria-label={`${label}: no`} />
}

/** Chronicle against one paid template and Pro. Every cell is true today. */
export function CompareTable() {
  return (
    <div tabIndex={0} role="region" aria-label="Chronicle, a paid template and Pro compared" className="overflow-x-auto rounded-2xl bg-card shadow-(--surface-shadow) outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th scope="col" className="p-4 text-start font-medium">
              What you get
            </th>
            <th scope="col" className="w-32 p-4 text-center font-medium">
              Chronicle
            </th>
            <th scope="col" className="w-32 p-4 text-center font-medium">
              One template
            </th>
            <th scope="col" className="w-32 bg-accent/60 p-4 text-center font-medium text-accent-foreground">
              Pro
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b last:border-b-0">
              <th scope="row" className="p-4 text-start font-normal">
                {row.label}
              </th>
              <td className="p-4 text-center">
                <Mark value={row.free} label={`${row.label}, Chronicle`} />
              </td>
              <td className="p-4 text-center">
                <Mark value={row.single} label={`${row.label}, one template`} />
              </td>
              <td className="bg-accent/60 p-4 text-center">
                <Mark value={row.pro} label={`${row.label}, Pro`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
