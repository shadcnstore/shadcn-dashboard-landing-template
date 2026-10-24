import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { ChronicleMark } from "@/components/chronicle/logo"
import { StatusPage } from "@/kit/states/status-page"
import { cn } from "@/lib/utils"

type Action = { label: string; href: string }

/**
 * A full-page error outside the shell: the Chronicle mark, the Kit's
 * StatusPage, and a way home. Used by app/errors/* and app/not-found.tsx.
 */
export function ErrorScreen({
  code,
  title,
  description,
  secondary,
}: {
  code: React.ReactNode
  title: string
  description: React.ReactNode
  secondary?: Action
}) {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:48px_48px] opacity-50 [mask-image:radial-gradient(ellipse_50%_45%_at_50%_45%,black,transparent)]"
      />
      <header className="px-4 py-6 sm:px-8">
        <Link href="/" className="flex w-fit items-center gap-2 font-semibold tracking-tight">
          <ChronicleMark className="size-6" />
          Chronicle
        </Link>
      </header>
      <main className="flex flex-1 flex-col">
        <StatusPage
          code={code}
          title={title}
          description={description}
          actions={
            <>
              <Link href="/" className={buttonVariants({ size: "lg" })}>
                Go to the dashboard
              </Link>
              {secondary && (
                <Link href={secondary.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-card")}>
                  {secondary.label}
                </Link>
              )}
            </>
          }
        />
      </main>
    </div>
  )
}
