import { BRAND } from "@/config/brand"
import { cn } from "@/lib/utils"

import { ShadcnStoreMark } from "./shadcnstore-mark"

/** The mark and the name, set in the UI font, from config/brand.ts. */
export function BrandLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  const Mark = BRAND.mark
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <Mark className={cn("size-6", markClassName)} />
      {BRAND.name}
    </span>
  )
}

/** "Template by ShadcnStore" (or another label): the small credit. Renders nothing when BRAND.credits.show is false. */
export function BrandCredit({ label = "Template by", className }: { label?: string; className?: string }) {
  if (!BRAND.credits.show) {
    return null
  }
  return (
    <a href={BRAND.credits.href} target="_blank" rel="noopener" className={cn("inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground", className)}>
      {label}
      <ShadcnStoreMark className="size-4" />
      <span className="font-medium">{BRAND.credits.by}</span>
    </a>
  )
}
