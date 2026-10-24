"use client"

import { ArrowUpRightIcon, CheckIcon, MinusIcon, StarIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/kit/ui-patterns/page-header"
import { cn } from "@/lib/utils"

import { PAID_TEMPLATES, PRO, REPO, STORE } from "./config"
import { trackFunnel } from "./track"

/** What is in Chronicle, and what the paid dashboard templates add. Honest rows only: every tick is true. */
const ROWS: { label: string; chronicle: boolean; paid: boolean }[] = [
  { label: "Shell, sidebar and top-nav layouts, RTL", chronicle: true, paid: true },
  { label: "Theme customizer with presets, ⌘K, keyboard shortcuts", chronicle: true, paid: true },
  { label: "Data adapter, data table, saved views, CSV", chronicle: true, paid: true },
  { label: "Chart widgets, notifications, settings frame, account", chronicle: true, paid: true },
  { label: "A complete business: its records, screens and reconciling dataset", chronicle: false, paid: true },
  { label: "An assistant that proposes changes for your approval", chronicle: false, paid: true },
  { label: "Team and roles, billing and plans, API keys", chronicle: false, paid: true },
  { label: "Animated sign-in with a WebGL brand panel", chronicle: false, paid: true },
  { label: "Licence", chronicle: true, paid: true },
]

function Mark({ value, label }: { value: boolean | string; label: string }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>
  }
  return value ? <CheckIcon className="mx-auto size-4 text-success" aria-label={`${label}: included`} /> : <MinusIcon className="mx-auto size-4 text-muted-foreground" aria-label={`${label}: not included`} />
}

export function GoFurtherPage() {
  return (
    <>
      <PageHeader
        title="Go further"
        description="Chronicle gives you the frame. The paid templates give you a business built on the same Kit."
        actions={
          <a href={REPO} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline" })} onClick={() => trackFunnel("further-github")}>
            <StarIcon data-icon="inline-start" />
            Star Chronicle
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {PAID_TEMPLATES.map((template) => (
          <Card key={template.slug} className="rounded-2xl shadow-(--surface-shadow) ring-foreground/5">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.live ? <span className="font-mono text-sm tabular-nums">{template.price}</span> : <Badge variant="secondary">Coming soon</Badge>}
              </div>
              <CardDescription>{template.kind}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3 text-sm">
              <p>{template.adds}</p>
              <ul className="grid gap-1.5 text-muted-foreground">
                {template.screens.map((screen) => (
                  <li key={screen} className="flex items-center gap-2">
                    <CheckIcon className="size-3.5 text-primary" aria-hidden />
                    {screen}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <a href={template.href} target="_blank" rel="noopener" className={buttonVariants({ size: "sm" })} onClick={() => trackFunnel("further-template", { target: template.slug })}>
                {template.live ? `See ${template.name}` : "Read about it"}
                <ArrowUpRightIcon data-icon="inline-end" />
              </a>
              {template.demo && (
                <a href={template.demo} target="_blank" rel="noopener" className={buttonVariants({ size: "sm", variant: "ghost" })} onClick={() => trackFunnel("further-demo", { target: template.slug })}>
                  Live demo
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
        <Card className="rounded-2xl bg-primary text-primary-foreground shadow-(--surface-shadow-raised) ring-0">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Pro</CardTitle>
              <span className="font-mono text-sm tabular-nums">{PRO.price}</span>
            </div>
            <CardDescription className="text-primary-foreground">{PRO.note}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 text-sm">
            <p>Every paid template, including the ones that launch later, and every premium block on ShadcnStore.</p>
          </CardContent>
          <CardFooter className="border-primary-foreground/20 bg-transparent">
            <a href={PRO.href} target="_blank" rel="noopener" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} onClick={() => trackFunnel("further-pro")}>
              {PRO.label}
              <ArrowUpRightIcon data-icon="inline-end" />
            </a>
          </CardFooter>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-(--surface-shadow) ring-foreground/5">
        <CardHeader>
          <CardTitle>What is in each</CardTitle>
          <CardDescription>Every row is true today. The paid column describes Emporium, the dashboard template on sale now.</CardDescription>
        </CardHeader>
        <CardContent tabIndex={0} role="region" aria-label="Comparison table, scrolls sideways" className="overflow-x-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th scope="col" className="py-2 text-start font-medium">
                  Feature
                </th>
                <th scope="col" className="w-28 py-2 text-center font-medium">
                  Chronicle
                </th>
                <th scope="col" className="w-28 py-2 text-center font-medium">
                  Paid templates
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <th scope="row" className="py-3 pe-4 text-start font-normal">
                    {row.label}
                  </th>
                  <td className="py-3 text-center">{row.label === "Licence" ? <Mark value="MIT" label={row.label} /> : <Mark value={row.chronicle} label={row.label} />}</td>
                  <td className="py-3 text-center">{row.label === "Licence" ? <Mark value="Commercial" label={row.label} /> : <Mark value={row.paid} label={row.label} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        <CardFooter>
          <a href={`${STORE}/templates/dashboards`} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "sm" })} onClick={() => trackFunnel("further-all")}>
            All dashboard templates
            <ArrowUpRightIcon data-icon="inline-end" />
          </a>
        </CardFooter>
      </Card>
    </>
  )
}
