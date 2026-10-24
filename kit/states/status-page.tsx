import { cn } from "@/lib/utils"

/**
 * A whole-page state: not found, something broke, down for maintenance.
 * `code` is the big figure (404, 500), or an icon when there is no number.
 */
export function StatusPage({
  code,
  title,
  description,
  actions,
  className,
}: {
  code: React.ReactNode
  title: string
  description: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-1 items-center justify-center p-6", className)}>
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="font-mono text-6xl font-semibold tracking-tight text-muted-foreground tabular-nums">{code}</div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-balance text-muted-foreground">{description}</p>
        {actions && <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
