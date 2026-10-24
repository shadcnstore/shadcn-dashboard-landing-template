"use client"

import { StarIcon } from "lucide-react"

import { PAID_TEMPLATES, PRO, REPO, STORE } from "./config"
import { CompareTable, OutLink, ProBand, ProductCard, Screenshot, StatusBadge } from "./further-parts"
import { trackFunnel } from "./track"

/**
 * Direction A, "Showcase": the products first. A featured live template with
 * its real screen, the coming ones in a grid, Pro as one plain offer, then the
 * comparison. Everything comes from features/demo/config.ts.
 */
export function GoFurtherPage() {
  const live = PAID_TEMPLATES.filter((template) => template.status === "live")
  const soon = PAID_TEMPLATES.filter((template) => template.status === "soon")
  const featured = live[0]

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">From the makers of Chronicle</p>
        <h1 className="max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Chronicle is the frame. These templates are whole products built on it.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Each one uses the same Dashboard Kit as Chronicle, adds the screens and data of a real business, and is sold as a one-time purchase. Pro includes all of them.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <OutLink href={PRO.href} placement="further-hero-pro">
            Get Pro, {PRO.price} one-time
          </OutLink>
          <OutLink href={`${STORE}/templates/dashboards`} placement="further-hero-templates" variant="outline">
            Browse templates
          </OutLink>
          <a href={REPO} target="_blank" rel="noopener" className="ms-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={() => trackFunnel("further-github")}>
            <StarIcon className="size-4" aria-hidden />
            Or star Chronicle on GitHub
          </a>
        </div>
      </header>

      {featured && (
        <section aria-labelledby="featured-heading" className="grid items-center gap-6 rounded-2xl bg-card p-4 shadow-(--surface-shadow) xl:grid-cols-[1.4fr_1fr] xl:p-6">
          <Screenshot template={featured} priority />
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge template={featured} />
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Available now · {featured.kind}</span>
            </div>
            <h2 id="featured-heading" className="font-heading text-2xl font-semibold tracking-tight">
              {featured.name}
            </h2>
            <p className="text-muted-foreground">{featured.pitch}</p>
            <ul className="grid gap-2 text-sm">
              {featured.adds.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <OutLink href={featured.href} placement="further-featured" target={featured.slug}>
                See {featured.name}, ${featured.price}
              </OutLink>
              {featured.demo && (
                <OutLink href={featured.demo} placement="further-demo" target={featured.slug} variant="outline">
                  Open the live demo
                </OutLink>
              )}
            </div>
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section aria-labelledby="soon-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="soon-heading" className="font-heading text-xl font-semibold tracking-tight">
              Built, launching next
            </h2>
            <p className="text-sm text-muted-foreground">Real screens from each template. Pro owners get every one as it launches.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {soon.map((template) => (
              <ProductCard key={template.slug} template={template} />
            ))}
          </div>
        </section>
      )}

      <ProBand />

      <section aria-labelledby="compare-heading" className="flex flex-col gap-4">
        <h2 id="compare-heading" className="font-heading text-xl font-semibold tracking-tight">
          Free, one template, or Pro
        </h2>
        <CompareTable />
      </section>
    </div>
  )
}
