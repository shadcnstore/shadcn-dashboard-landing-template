import { cn } from "@/lib/utils"

/** Tidewell, the fictional product the landing page sells: a cobalt tile with a tide line rising. */
export function TidewellMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6", className)}>
      <rect width="24" height="24" rx="6" className="fill-primary" />
      <path
        d="M5 15.5c2 0 2.5-2.5 4.5-2.5s2.5 2.5 4.5 2.5 2.5-5 5-5"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
    </svg>
  )
}

export function TidewellLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <TidewellMark />
      Tidewell
    </span>
  )
}
