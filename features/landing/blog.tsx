import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { Section, SectionHeading } from "./section-heading"

/**
 * Each cover is the real Chronicle widget the article is about (captured from
 * the app, public/landing/card-*), laid over a second card on a backdrop drawn
 * with the theme's tokens, so it follows light, dark and every preset.
 */
type Shot = { card: string; width: number; height: number; w: number; x: number; y: number }

const COVERS: Record<string, { front: Shot; back: Shot }> = {
  nrr: { front: { card: "nrr", width: 365, height: 236, w: 46, x: 10, y: 22 }, back: { card: "mrr", width: 747, height: 520, w: 62, x: 40, y: 10 } },
  close: { front: { card: "movement", width: 747, height: 773, w: 44, x: 9, y: 14 }, back: { card: "top", width: 1128, height: 546, w: 70, x: 36, y: 22 } },
  annual: { front: { card: "plan", width: 365, height: 358, w: 36, x: 11, y: 12 }, back: { card: "cohort", width: 1128, height: 588, w: 74, x: 32, y: 18 } },
}

function CardShot({ shot, back = false }: { shot: Shot; back?: boolean }) {
  const src = (theme: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing/card-${shot.card}-${theme}.webp`
  return (
    <div
      className={cn("absolute overflow-hidden shadow-[0_24px_48px_-24px_color-mix(in_oklch,var(--foreground)_45%,transparent)] ring-1 ring-foreground/10", back && "opacity-60 saturate-50")}
      // The card's own 16px corner, scaled with the cover (cqw), so the crop lines up at every width.
      style={{ left: `${shot.x}%`, top: `${shot.y}%`, width: `${shot.w}%`, borderRadius: `${(16 * shot.w) / shot.width}cqw` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src("light")} alt="" width={shot.width} height={shot.height} loading="lazy" decoding="async" className="block h-auto w-full dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src("dark")} alt="" width={shot.width} height={shot.height} loading="lazy" decoding="async" className="hidden h-auto w-full dark:block" />
    </div>
  )
}

function JournalCover({ cover, label }: { cover: keyof typeof COVERS; label: string }) {
  const { front, back } = COVERS[cover]
  return (
    <div role="img" aria-label={label} className="@container relative isolate h-full min-h-40 overflow-hidden bg-linear-to-br from-primary/15 via-primary/5 to-muted">
      <div aria-hidden className="absolute inset-0 -z-10 [background-image:radial-gradient(color-mix(in_oklch,var(--primary)_30%,transparent)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_70%_70%_at_35%_40%,black,transparent)]" />
      <div aria-hidden className="absolute -start-1/4 -top-1/2 -z-10 h-[120%] w-3/4 rounded-full bg-background/70 blur-3xl" />
      <CardShot shot={back} back />
      <CardShot shot={front} />
    </div>
  )
}
const POSTS = [
  {
    category: "Metrics",
    title: "Net revenue retention, without the hand-waving",
    description: "How we calculate NRR, which edge cases change it, and the three mistakes we see most often.",
    date: "Oct 14",
    minutes: 7,
    cover: "nrr" as const,
    alt: "Chronicle's net revenue retention card, 99.7% with expansion, contraction and churn, over the MRR chart",
  },
  {
    category: "Finance",
    title: "Closing the month in one afternoon",
    description: "A checklist for reconciling subscription revenue with your ledger, step by step.",
    date: "Sep 30",
    minutes: 5,
    cover: "close" as const,
    alt: "Chronicle's MRR movement chart over the top accounts table",
  },
  {
    category: "Growth",
    title: "What annual plans really do to churn",
    description: "We compared retention across plan lengths in anonymised data. The answer is more nuanced than you think.",
    date: "Sep 12",
    minutes: 9,
    cover: "annual" as const,
    alt: "Chronicle's revenue by plan card over the retention by signup cohort heatmap",
  },
]

export function Blog() {
  return (
    <Section id="journal" className="bg-muted/50">
      <SectionHeading eyebrow="Journal" title="Notes on subscription metrics" lede="Practical writing from the team, for people who own the revenue number." />
      <ul className="mt-16 grid gap-6 lg:grid-cols-3">
        {POSTS.map((post) => (
          <li key={post.title}>
            {/* One per row between 640 and 1024px, so the cover sits beside the text instead of filling a screen-wide 2:1 block. */}
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-(--surface-shadow) sm:flex-row lg:flex-col">
              <div className="relative aspect-[2/1] overflow-hidden border-b sm:aspect-auto sm:w-2/5 sm:shrink-0 sm:border-e sm:border-b-0 lg:aspect-[2/1] lg:w-auto lg:border-e-0 lg:border-b">
                <JournalCover cover={post.cover} label={post.alt} />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6 sm:justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span>
                    {post.date} · {post.minutes} min read
                  </span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-balance">{post.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">{post.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  )
}
