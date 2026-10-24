import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type Tone = "neutral" | "success" | "warning" | "info" | "danger" | "muted"

const TONES: Record<Tone, string> = {
  neutral: "",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/20 text-warning-foreground dark:text-warning",
  info: "border-transparent bg-info/15 text-info",
  danger: "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
  muted: "border-transparent bg-muted text-muted-foreground",
}

const DOTS: Record<Tone, string> = {
  neutral: "bg-foreground/60",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  danger: "bg-destructive",
  muted: "bg-muted-foreground",
}

/**
 * One badge for every status in the app. Colours come from the theme's
 * status tokens, so a preset change recolours every status at once.
 */
export function StatusBadge({ tone, children, dot = true, className }: { tone: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", TONES[tone], className)}>
      {dot && <span className={cn("size-1.5 rounded-full", DOTS[tone])} aria-hidden />}
      {children}
    </Badge>
  )
}
