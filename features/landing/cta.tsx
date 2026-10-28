import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { TRIAL_DAYS } from "@/data/generate"
import { cn } from "@/lib/utils"

import { DotGrid } from "./section-heading"

export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-muted/50 py-24 sm:py-32">
      <DotGrid className="[mask-image:radial-gradient(ellipse_50%_60%_at_50%_50%,black,transparent)]" />
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <h2 id="cta-title" className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Close next month with numbers{" "}
          <span className="bg-linear-to-r from-foreground to-foreground/45 bg-clip-text text-transparent">everyone trusts</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          Explore the dashboard with sample data, or start a {TRIAL_DAYS}-day free trial and connect your own billing in minutes.
        </p>
        <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
            Start a free trial
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 bg-background px-5 text-base")}>
            Open the live dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
