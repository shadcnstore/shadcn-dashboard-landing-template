"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"

import { Link, usePathname, useRouter } from "../framework"
import { useBreadcrumbLabel } from "../shell/breadcrumbs"
import { activeHref } from "../shell/nav-active"
import type { NavLink } from "../shell/types"
import { PageHeader } from "../ui-patterns/page-header"

export interface SettingsGroup {
  label: string
  items: NavLink[]
}

/**
 * Where the current section's link sits in the menu. The highlight slides
 * there (transitions.dev "tabs-sliding"); `ready` stays false for the first
 * measurement so it appears in place rather than sliding in from the top.
 */
function useActiveRect(nav: React.RefObject<HTMLElement | null>, current: string | undefined) {
  const [rect, setRect] = useState<{ top: number; height: number } | null>(null)
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => {
    const node = nav.current
    if (!node) {
      return
    }
    const measure = () => {
      const link = node.querySelector<HTMLElement>('[aria-current="page"]')
      setRect(link ? { top: link.offsetTop, height: link.offsetHeight } : null)
    }
    measure()
    const frame = requestAnimationFrame(() => setReady(true))
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [nav, current])
  return { rect, ready }
}

/**
 * The settings frame: a list of sections beside the content on wide screens,
 * a select above it on phones. Each section is its own page and its own save.
 */
export function SettingsLayout({
  groups,
  title = "Settings",
  description = "Your workspace, your team and your account.",
  children,
}: {
  groups: SettingsGroup[]
  title?: string
  /** One line under the title: what the settings cover in this product. */
  description?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = useRef<HTMLElement>(null)
  const links = groups.flatMap((group) => group.items)
  const current = activeHref(pathname, links) ?? links[0]?.href
  const { rect, ready } = useActiveRect(nav, current)
  // The breadcrumb names the section the way this menu does ("API keys", not "Api keys").
  useBreadcrumbLabel(pathname === "/settings" ? null : (links.find((link) => link.href === current)?.title ?? null))

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="grid items-start gap-6 lg:grid-cols-[13rem_1fr]">
        <nav ref={nav} aria-label="Settings sections" className="relative hidden flex-col gap-5 lg:sticky lg:top-20 lg:flex">
          {rect && (
            <span
              aria-hidden
              className={cn("absolute inset-x-0 top-0 rounded-lg bg-card shadow-(--surface-shadow) ring-1 ring-foreground/5", ready && "transition-[translate,height] duration-250 ease-smooth-out")}
              style={{ translate: `0 ${rect.top}px`, height: rect.height }}
            />
          )}
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5">
              <span className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = current === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group/link relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                      !active && "hover:bg-muted/60",
                      active && "font-medium text-foreground"
                    )}
                  >
                    {Icon && <Icon className={cn("size-4 transition-colors duration-150", active && "text-primary")} />}
                    {item.title}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <NativeSelect aria-label="Settings section" className="lg:hidden" value={current} onChange={(event) => router.push(event.target.value)}>
          {groups.map((group) => (
            <NativeSelectOptGroup key={group.label} label={group.label}>
              {group.items.map((item) => (
                <NativeSelectOption key={item.href} value={item.href}>
                  {item.title}
                </NativeSelectOption>
              ))}
            </NativeSelectOptGroup>
          ))}
        </NativeSelect>
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
      </div>
    </>
  )
}
