import { cn } from "@/lib/utils"

/** The small pill, heading and lede every landing section opens with (v2's rhythm). */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  id,
  className,
}: {
  eyebrow: string
  title: string
  lede?: string
  align?: "center" | "start"
  id?: string
  className?: string
}) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-5", align === "center" && "mx-auto items-center text-center", className)}>
      <p className="w-fit rounded-full border bg-background px-3 py-1 text-xs font-medium">{eyebrow}</p>
      <h2 id={id} className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {lede && <p className="text-lg text-pretty text-muted-foreground">{lede}</p>}
    </div>
  )
}

/** Shared section frame: width, gutters, and room under the sticky header for anchor jumps. */
export function Section({ id, className, children, labelledBy }: { id?: string; className?: string; children: React.ReactNode; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-16 py-20 sm:py-28 lg:py-32", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}

/** v2's dot grid, faded at the edges. Tokens only, no image. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(color-mix(in_oklch,var(--foreground)_22%,transparent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]",
        className
      )}
    />
  )
}

/** A real Chronicle screen in light and dark. Only the one for the current theme shows (a display: none image is not read out), and the hidden one is lazy, so it is not fetched. */
export function Screenshot({
  name,
  alt,
  sizes,
  widths,
  width,
  height,
  priority = false,
  className,
}: {
  /** File stem in public/landing, e.g. "users" for users-light-1200.webp. */
  name: string
  alt: string
  sizes: string
  /** The widths each file comes in, smallest first. */
  widths: number[]
  width: number
  height: number
  priority?: boolean
  className?: string
}) {
  const base = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing/${name}`
  const set = (theme: string) => widths.map((size) => `${base}-${theme}-${size}.webp ${size}w`).join(", ")
  const largest = widths[widths.length - 1]
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}-light-${largest}.webp`}
        srcSet={set("light")}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("block h-auto w-full dark:hidden", className)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}-dark-${largest}.webp`}
        srcSet={set("dark")}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("hidden h-auto w-full dark:block", className)}
      />
    </>
  )
}
