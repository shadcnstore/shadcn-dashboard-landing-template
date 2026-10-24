import { cn } from "@/lib/utils"

/** Chronicle's mark: a cobalt tile with three ruled lines, a page of a log book. */
export function ChronicleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", className)}>
      <rect width="24" height="24" rx="6" className="fill-primary" />
      <path d="M7 8h10M7 12h7M7 16h4" strokeWidth="2" strokeLinecap="round" className="stroke-primary-foreground" />
    </svg>
  )
}
