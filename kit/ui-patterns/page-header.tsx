import { cn } from "@/lib/utils"

/**
 * The top of every page: title, one line of context, and actions. Keeping it
 * the same everywhere is what makes forty screens feel like one product.
 */
export function PageHeader({
  title,
  description,
  actions,
  meta,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons on the right. Put the primary action last. */
  actions?: React.ReactNode
  /** Badges or status next to the title. */
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          {meta}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
