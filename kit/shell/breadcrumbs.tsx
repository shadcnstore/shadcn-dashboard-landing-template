"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createContext, Fragment, useContext, useEffect, useState, useSyncExternalStore } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import type { NavLink } from "./types"

type Setter = (label: string | null) => void

const LabelContext = createContext<{ label: string | null; setLabel: Setter } | null>(null)

export function BreadcrumbLabelProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabel] = useState<string | null>(null)
  return <LabelContext.Provider value={{ label, setLabel }}>{children}</LabelContext.Provider>
}

/**
 * Detail pages name the last crumb themselves, e.g. "#1042" instead of the
 * raw id in the address.
 */
export function useBreadcrumbLabel(label: string | null) {
  const context = useContext(LabelContext)
  useEffect(() => {
    context?.setLabel(label)
    return () => context?.setLabel(null)
  }, [context, label])
}

function titleFor(href: string, links: NavLink[]): string | null {
  for (const link of links) {
    if (link.href === href) {
      return link.title
    }
    const nested = link.items ? titleFor(href, link.items) : null
    if (nested) {
      return nested
    }
  }
  return null
}

function humanize(segment: string): string {
  const text = decodeURIComponent(segment).replace(/[-_]/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const noop = () => () => {}

/**
 * The static demo pre-renders detail pages once, as `/orders/_`, so the server
 * HTML cannot know the real id. Segments that are not a nav page are only
 * named after hydration, which keeps the first client render identical.
 */
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}

export function Breadcrumbs({ links, home }: { links: NavLink[]; home: { title: string; href: string } }) {
  const pathname = usePathname()
  const context = useContext(LabelContext)
  const hydrated = useHydrated()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs = segments.map((_, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLast = index === segments.length - 1
    const title = (isLast && context?.label) || titleFor(href, links) || (hydrated ? humanize(segments[index]) : "")
    return { href, title, isLast }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.length === 0 ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{home.title}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          crumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={crumb.isLast ? undefined : "hidden md:block"}>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
