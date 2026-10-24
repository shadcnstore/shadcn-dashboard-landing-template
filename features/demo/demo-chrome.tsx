"use client"

import { ArrowUpRightIcon, StarIcon, XIcon } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DemoAnalytics } from "@/kit/shell/demo-bar"
import { cn } from "@/lib/utils"

import { REPO, STORE } from "./config"
import { trackFunnel } from "./track"

const STORAGE_KEY = "chronicle-demo-bar-hidden"
const noop = () => () => {}

function readHidden(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

/**
 * The public demo's only persistent marketing: a small pill that says what
 * Chronicle is and offers two ways on. Closing it hides it for the visit.
 * Rendered by app/layout only when DEMO_BUILD=1.
 */
function DemoBar() {
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
    <>
      {/* Room under the last row of the page while the bar floats over it; gone with the bar. */}
      <div aria-hidden className="h-20" />
      <div
        role="region"
        aria-label="About the Chronicle template"
        className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-2 rounded-2xl border bg-popover/95 p-2 ps-4 text-popover-foreground shadow-lg backdrop-blur sm:inset-x-auto sm:start-1/2 sm:w-max sm:max-w-none sm:-translate-x-1/2 rtl:sm:translate-x-1/2"
      >
        <p className="me-1 min-w-0 text-sm leading-tight">
          <span className="font-semibold">Chronicle</span>
          <span className="hidden text-muted-foreground sm:inline">
            {" "}
            is a free, MIT-licensed shadcn admin template.
          </span>
        </p>
        <a
          href={REPO}
          target="_blank"
          rel="noopener"
          className={cn(buttonVariants({ size: "sm" }), "ms-auto shrink-0")}
          onClick={() => trackFunnel("bar-github")}
        >
          <StarIcon data-icon="inline-start" />
          Star on GitHub
        </a>
        <a
          href={`${STORE}/templates/dashboards`}
          target="_blank"
          rel="noopener"
          className={cn(
            buttonVariants({ size: "sm", variant: "ghost" }),
            "hidden shrink-0 md:inline-flex"
          )}
          onClick={() => trackFunnel("bar-templates")}
        >
          Paid templates
          <ArrowUpRightIcon
            data-icon="inline-end"
            className="rtl:-scale-x-100"
          />
        </a>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          aria-label="Hide this bar"
          onClick={close}
        >
          <XIcon />
        </Button>
      </div>
    </>
  )
}

export function DemoChrome({ gtmId }: { gtmId?: string }) {
  return (
    <>
      <DemoBar />
      {gtmId && <DemoAnalytics gtmId={gtmId} />}
    </>
  )
}
