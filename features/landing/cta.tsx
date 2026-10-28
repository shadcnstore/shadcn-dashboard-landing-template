import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-2xl bg-(--auth-panel) px-6 py-16 text-center text-(--auth-panel-foreground) sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--auth-panel-foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--auth-panel-foreground)_8%,transparent)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent)]"
        />
        <h2 id="cta-title" className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Close next month with numbers everyone trusts
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty opacity-75">Explore the dashboard with sample data, or start a free trial and connect your own billing in minutes.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
            Open the dashboard
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 border-(--auth-panel-foreground)/20 bg-transparent px-4 text-(--auth-panel-foreground) hover:bg-(--auth-panel-foreground)/10 hover:text-(--auth-panel-foreground) dark:border-(--auth-panel-foreground)/20 dark:bg-transparent"
            )}
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  )
}
