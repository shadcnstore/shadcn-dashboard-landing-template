import { Badge } from "@/components/ui/badge"

import { Section, SectionHeading } from "./section-heading"

/** Journal entries. The covers are drawn with tokens, so no image is loaded. */
const POSTS = [
  {
    category: "Metrics",
    title: "Net revenue retention, without the hand-waving",
    description: "How we calculate NRR, which edge cases change it, and the three mistakes we see most often.",
    date: "Oct 14",
    minutes: 7,
    bars: [38, 52, 46, 64, 58, 76, 70, 88],
  },
  {
    category: "Finance",
    title: "Closing the month in one afternoon",
    description: "A checklist for reconciling subscription revenue with your ledger, step by step.",
    date: "Sep 30",
    minutes: 5,
    bars: [80, 72, 66, 58, 50, 44, 36, 30],
  },
  {
    category: "Growth",
    title: "What annual plans really do to churn",
    description: "We compared retention across plan lengths in anonymised data. The answer is more nuanced than you think.",
    date: "Sep 12",
    minutes: 9,
    bars: [44, 60, 48, 70, 52, 78, 56, 84],
  },
]

export function Blog() {
  return (
    <Section id="journal" className="bg-muted/40">
      <SectionHeading eyebrow="Journal" title="Notes on subscription metrics" lede="Practical writing from the team, for people who own the revenue number." />
      <ul className="mt-14 grid gap-4 lg:grid-cols-3">
        {POSTS.map((post) => (
          <li key={post.title}>
            {/* One per row between 640 and 1024px, so the cover sits beside the text instead of filling a screen-wide 2:1 block. */}
            <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-(--surface-shadow) sm:flex-row lg:flex-col">
              <div aria-hidden className="flex aspect-[2/1] items-end gap-1.5 border-b bg-accent/60 px-6 pt-6 sm:aspect-auto sm:min-h-44 sm:w-2/5 sm:shrink-0 sm:border-e sm:border-b-0 lg:aspect-[2/1] lg:min-h-0 lg:w-auto lg:border-e-0 lg:border-b">
                {post.bars.map((height, index) => (
                  <span key={index} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${height}%`, opacity: 0.35 + index * 0.08 }} />
                ))}
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
