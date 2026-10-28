import { ArrowRightIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { TRIAL_DAYS } from "@/data/generate"
import { cn } from "@/lib/utils"

import { DotGrid, Screenshot } from "./section-heading"

const HERO_SIZES = "(min-width: 1200px) 1152px, 96vw"

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-24">
      <DotGrid />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <a href="#features" className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/80 bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
            <SparklesIcon className="size-3.5" aria-hidden />
            New: cohort retention, split by plan
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </a>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Run your subscription business{" "}
            <span className="bg-linear-to-r from-foreground to-foreground/45 bg-clip-text text-transparent">from one screen</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Tidewell puts revenue, accounts, seats and your team&rsquo;s work side by side: MRR you can reconcile to the cent, the accounts that need you today, and the tasks that fix them.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Start a free trial
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 bg-background px-5 text-base")}>
              Open the live dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{TRIAL_DAYS}-day free trial on every plan. No card needed.</p>
        </div>

        {/* The demo bar stays out of the way while this is on screen (data-demo-bar-clear, features/demo/demo-chrome.tsx).
            Lazy on purpose: on phones it sits below the fold, and on wide screens a lazy image in view still loads at once. */}
        <div data-demo-bar-clear className="relative mx-auto mt-20 max-w-6xl">
          <div aria-hidden className="absolute -top-8 left-1/2 -z-10 h-40 w-[85%] -translate-x-1/2 rounded-full bg-foreground/15 blur-3xl lg:h-72" />
          <div className="relative overflow-hidden rounded-xl border bg-card p-1.5 shadow-(--surface-shadow-raised) sm:rounded-2xl sm:p-2">
            <Screenshot
              name="overview"
              alt="Tidewell's overview: monthly recurring revenue, sign-ups, retention and paying accounts"
              widths={[960, 1600]}
              width={1600}
              height={1000}
              sizes={HERO_SIZES}
              className="rounded-lg sm:rounded-xl"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background sm:h-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
