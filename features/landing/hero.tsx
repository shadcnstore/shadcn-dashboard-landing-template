import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ProductPreview } from "./product-preview"

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20">
      {/* A hairline grid that fades out under the headline; tokens only, no image. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] opacity-60 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-[34rem] -z-10 mx-auto h-72 max-w-4xl rounded-full bg-primary/15 blur-3xl" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <a
            href="#features"
            className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/80 py-1 ps-1 pe-3 text-xs text-muted-foreground shadow-(--surface-shadow) transition-colors hover:text-foreground"
          >
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">New</span>
            Cohort retention, split by plan
            <ArrowRightIcon className="size-3" />
          </a>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Know where every dollar of recurring revenue <span className="text-primary">comes from</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            Tidewell turns your billing data into MRR, churn and retention you can trust, reconciled to the cent and ready the
            morning after you connect.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
              Open the dashboard
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <a href="#pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 bg-card px-4")}>
              See pricing
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free for your first $10k MRR. No card needed.</p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
          <ProductPreview />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background" />
        </div>
      </div>
    </section>
  )
}
