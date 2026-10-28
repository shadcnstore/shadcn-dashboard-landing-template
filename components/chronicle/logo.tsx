import { cn } from "@/lib/utils"

/**
 * Chronicle's mark: a tile in the theme's primary colour holding an open "C"
 * that closes on a dot, a timeline that ends today. Drawn with the primary
 * tokens, so it follows the customizer. config/brand.ts says which mark the
 * app uses; swap it there.
 */
export function ChronicleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4 shrink-0", className)}>
      <rect width="24" height="24" rx="6.5" className="fill-primary" />
      <path d="M16.6 8.4A6 6 0 1 0 16.6 15.6" fill="none" strokeWidth="2.4" strokeLinecap="round" className="stroke-primary-foreground" />
      <circle cx="12" cy="12" r="1.9" className="fill-primary-foreground" />
    </svg>
  )
}
