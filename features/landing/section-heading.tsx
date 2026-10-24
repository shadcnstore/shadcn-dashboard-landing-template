import { cn } from "@/lib/utils"

/** The eyebrow, heading and lede every landing section opens with. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  className,
}: {
  eyebrow: string
  title: string
  lede?: string
  align?: "center" | "start"
  className?: string
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-4", align === "center" && "mx-auto items-center text-center", className)}>
      <p className="font-mono text-xs font-medium tracking-wider text-primary uppercase">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {lede && <p className="text-base text-pretty text-muted-foreground sm:text-lg">{lede}</p>}
    </div>
  )
}

/** Shared section frame: width, gutters, and room under the sticky header for anchor jumps. */
export function Section({ id, className, children, labelledBy }: { id?: string; className?: string; children: React.ReactNode; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-16 py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
