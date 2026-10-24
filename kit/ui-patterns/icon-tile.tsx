import { cn } from "@/lib/utils"

/**
 * Icon tiles take their colour from the chart palette and the status tokens,
 * so a theme change recolours them the way it does the charts.
 */
export type TileTone = "lead" | "two" | "three" | "success" | "info" | "warning" | "danger" | "muted"

export const TILE_TONES: Record<TileTone, string> = {
  lead: "bg-primary/15 text-primary",
  two: "bg-chart-2/15 text-chart-2",
  three: "bg-chart-3/15 text-chart-3",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
}

export function IconTile({ icon: Icon, tone = "lead", size = "md", className }: { icon: React.ComponentType<{ className?: string }>; tone?: TileTone; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        size === "sm" && "size-8 rounded-lg [&>svg]:size-4",
        size === "md" && "size-10 rounded-xl [&>svg]:size-5",
        size === "lg" && "size-12 rounded-2xl [&>svg]:size-6",
        TILE_TONES[tone],
        className
      )}
      aria-hidden
    >
      <Icon />
    </span>
  )
}
