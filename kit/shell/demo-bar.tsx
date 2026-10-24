"use client"

import { ArrowUpRightIcon, XIcon } from "lucide-react"
import Script from "next/script"
import { useState, useSyncExternalStore } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "kit-demo-bar-hidden"
const noop = () => () => {}

function readHidden(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

type Tracker = { dataLayer?: Record<string, unknown>[]; gtag?: (command: "event", name: string, params: Record<string, unknown>) => void }

/**
 * Records a demo event for GA4. Pushed to the GTM data layer (queued even
 * before GTM loads) and sent through gtag when the page has it. Never a UTM
 * tag on the link: those start a new session on the sales page and break
 * referral attribution.
 */
export function trackDemoEvent(name: string, params: Record<string, unknown>): void {
  const tracker = window as unknown as Tracker
  tracker.dataLayer = tracker.dataLayer ?? []
  tracker.dataLayer.push({ event: name, ...params })
  tracker.gtag?.("event", name, params)
}

/**
 * Loads a Google Tag Manager container on the public demo only, so the
 * `demo_bar_click` event reaches GA4. Render it next to `DemoBar` behind the
 * same demo-build flag; a buyer's build never includes it.
 */
export function DemoAnalytics({ gtmId }: { gtmId: string }) {
  return (
    <Script id="kit-demo-gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
    </Script>
  )
}

/**
 * The floating "get this template" pill on the public demo. Only the demo
 * build renders it (see app/layout). Closing it hides it for the rest of the
 * visit, so it never stands between someone and the screen they are testing.
 * A click on "Get" fires the GA4 event `demo_bar_click` with the template's slug.
 */
export function DemoBar({ name, slug, tagline, href, className }: { name: string; slug: string; tagline: string; href: string; className?: string }) {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
  const [closed, setClosed] = useState(false)
  if (!hydrated || closed || readHidden()) {
    return null
  }
  const close = () => {
    setClosed(true)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // Private mode: it stays hidden until the page reloads.
    }
  }
  return (
    <div
      role="region"
      aria-label={`About the ${name} template`}
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-popover/95 p-2 ps-4 text-popover-foreground shadow-lg backdrop-blur sm:inset-x-auto sm:start-1/2 sm:w-max sm:max-w-none sm:-translate-x-1/2 rtl:sm:translate-x-1/2",
        className
      )}
    >
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">
          <span className="sm:hidden">{name} live demo</span>
          <span className="hidden sm:inline">You are viewing the {name} demo</span>
        </span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">{tagline}</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={cn(buttonVariants({ size: "sm" }), "ms-auto shrink-0")}
        onClick={() => trackDemoEvent("demo_bar_click", { template: slug, placement: "demo_bar" })}
      >
        Get {name}
        <ArrowUpRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
      </a>
      <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" aria-label="Hide this bar" onClick={close}>
        <XIcon />
      </Button>
    </div>
  )
}
