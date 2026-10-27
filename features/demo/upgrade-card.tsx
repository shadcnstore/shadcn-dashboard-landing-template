"use client"

import { ArrowUpRightIcon, ChevronUpIcon, SparklesIcon } from "lucide-react"
import { useRef } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { PAID_TEMPLATES, PRO } from "./config"
import { trackFunnel } from "./track"

const FEATURED = PAID_TEMPLATES.find((template) => template.status === "live") ?? PAID_TEMPLATES[0]
const OTHERS = PAID_TEMPLATES.filter((template) => template !== FEATURED)

/**
 * The demo bar's way to the paid templates: hover (or tap, or Enter) opens a
 * card with the live template's real screen, what else is coming, the two
 * honest prices and a link to each. Prices and links come from config.ts, so
 * launch day stays one edit there.
 */
export function UpgradeCard() {
  // One "open" event per opening, not one per hover flicker.
  const opened = useRef(false)
  const onOpenChange = (open: boolean) => {
    if (open && !opened.current) {
      trackFunnel("bar-card-open")
    }
    opened.current = open
  }
  const soon = OTHERS.filter((template) => template.status === "soon").map((template) => template.name)

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger openOnHover delay={120} closeDelay={250} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0 data-popup-open:bg-muted")}>
        <SparklesIcon data-icon="inline-start" className="text-primary" />
        <span className="sm:hidden">Templates</span>
        <span className="hidden sm:inline">Paid templates</span>
        <ChevronUpIcon data-icon="inline-end" className="transition-transform duration-200 in-data-popup-open:rotate-180" />
      </PopoverTrigger>
      <PopoverContent side="top" align="end" sideOffset={12} className="w-[min(23rem,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-2xl p-0">
        <div className="relative border-b bg-muted/40 p-3 pb-0">
          {/* Real screenshot of the live demo, bundled in public/demo/products. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FEATURED.image} alt={`${FEATURED.name}, the ${FEATURED.kind.toLowerCase()} template`} width={1200} height={750} className="block aspect-[16/10] w-full rounded-t-lg border border-b-0 object-cover object-top-left" />
          <span className="absolute start-5 top-5 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm ring-1 ring-foreground/10 backdrop-blur">
            <span className="me-1.5 inline-block size-1.5 rounded-full bg-success align-middle" aria-hidden />
            {FEATURED.name}, live
          </span>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-semibold">Chronicle is the frame. A paid template is the whole business.</p>
            <p className="text-sm text-muted-foreground">{FEATURED.pitch}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex shrink-0 -space-x-3 rtl:space-x-reverse" aria-hidden>
              {OTHERS.map((template) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={template.slug} src={template.image} alt="" width={1200} height={750} loading="lazy" className="h-9 w-14 rounded-md border-2 border-popover object-cover object-top-left shadow-sm" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {soon.length > 0 ? `${soon.join(", ")}: coming next, included in Pro.` : `${OTHERS.map((template) => template.name).join(", ")}, all in Pro.`}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col gap-0.5 rounded-lg border p-2.5">
              <dt className="text-xs text-muted-foreground">{FEATURED.name}</dt>
              <dd>
                <span className="font-mono text-lg font-semibold tabular-nums">${FEATURED.price}</span>
                <span className="text-xs text-muted-foreground"> one time</span>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
              <dt className="text-xs text-muted-foreground">Pro, every template</dt>
              <dd>
                <span className="font-mono text-lg font-semibold tabular-nums">{PRO.price}</span>
                <span className="text-xs text-muted-foreground"> one time</span>
              </dd>
            </div>
          </dl>

          <div className="grid grid-cols-2 gap-2">
            <a href={FEATURED.href} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline" })} onClick={() => trackFunnel("bar-card-emporium", { target: FEATURED.slug })}>
              See {FEATURED.name}
              <ArrowUpRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
            </a>
            <a href={PRO.href} target="_blank" rel="noopener" className={buttonVariants()} onClick={() => trackFunnel("bar-card-pro")}>
              Get Pro
              <ArrowUpRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
