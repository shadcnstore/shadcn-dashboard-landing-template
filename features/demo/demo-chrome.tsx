"use client"

import { StarIcon, XIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useSyncExternalStore } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DemoAnalytics } from "@/kit/shell/demo-bar"
import { cn } from "@/lib/utils"

import { REPO } from "./config"
import { trackFunnel } from "./track"
import { UpgradeCard } from "./upgrade-card"

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
 * Chronicle is and offers two ways on: a GitHub star, and a card with the
 * paid templates (upgrade-card.tsx). Closing it hides it for the visit.
 * Rendered by app/layout only when DEMO_BUILD=1.
 */
/** Bar height plus its bottom gap: an element marked data-demo-bar-clear inside this band would sit under the bar. */
const BAR_BAND = 88

/**
 * True while an element marked `data-demo-bar-clear` (the landing hero's
 * screenshot) reaches the band the bar floats over, so the bar steps aside
 * instead of covering it.
 */
function useBarMustClear(): boolean {
  const pathname = usePathname()
  // Keyed by path, so leaving the landing page never leaves the bar hidden.
  const [state, setState] = useState({ path: "", clear: false })
  useEffect(() => {
    const target = document.querySelector("[data-demo-bar-clear]")
    if (!target) {
      return
    }
    let frame = 0
    const check = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      setState({ path: pathname, clear: rect.top < window.innerHeight && rect.bottom > window.innerHeight - BAR_BAND })
    }
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(check)
      }
    }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [pathname])
  return state.path === pathname && state.clear
}

function DemoBar() {
  const mustClear = useBarMustClear()
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
        inert={mustClear || undefined}
        data-clear={mustClear || undefined}
        className="fixed transition-[translate,opacity] duration-300 ease-out data-clear:pointer-events-none data-clear:translate-y-[calc(100%+1rem)] data-clear:opacity-0 inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-2 rounded-2xl border bg-popover/95 p-2 ps-4 text-popover-foreground shadow-lg backdrop-blur sm:inset-x-auto sm:start-1/2 sm:w-max sm:max-w-none sm:-translate-x-1/2 rtl:sm:translate-x-1/2 motion-reduce:transition-none"
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
          <span className="sm:hidden">Star</span>
          <span className="hidden sm:inline">Star on GitHub</span>
        </a>
        <UpgradeCard />
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
