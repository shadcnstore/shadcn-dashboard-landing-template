import { CheckIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { ChronicleMark } from "@/components/chronicle/logo"

import type { AuthVariant } from "./auth-paths"
import { AuthVariantProvider } from "./auth-variant"

const POINTS = ["MRR, churn and retention on one reconciled model", "Users, tasks, mail and calendar in one workspace", "Light, dark and right to left, out of the box"]
const PANEL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/auth/panel.webp`
const DEMO_NOTE = "Demo mode: any email and a password of 8 or more characters will do."

/**
 * Chronicle's auth frame: a quiet slate panel beside the form on wide screens,
 * the form alone on small ones. The panel art is one 68 KB webp, no shader.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-(--auth-panel) p-10 text-(--auth-panel-foreground) lg:flex">
        <Image src={PANEL} alt="" fill sizes="42vw" className="-z-10 object-cover" />
        <Link href="/landing" className="flex w-fit items-center gap-2 font-semibold tracking-tight">
          <ChronicleMark className="size-6" />
          Chronicle
        </Link>
        <div className="mt-auto flex max-w-md flex-col gap-6 pb-10">
          <p className="text-3xl leading-tight font-semibold tracking-tight text-balance">Every number in Chronicle adds up.</p>
          <ul className="flex flex-col gap-3 text-sm opacity-80">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-60">{DEMO_NOTE}</p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <Link href="/landing" className="flex w-fit items-center gap-2 font-semibold tracking-tight lg:hidden">
          <ChronicleMark className="size-6" />
          Chronicle
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground lg:hidden">{DEMO_NOTE}</p>
      </main>
    </div>
  )
}

export function AuthHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/** Layout 2: the form on a card, centered on a quiet grid, with the brand above it. */
export function AuthCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-muted/40 dark:bg-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px] opacity-60 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_40%,black,transparent)]"
      />
      <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <Link href="/landing" className="flex w-fit items-center gap-2 font-semibold tracking-tight">
          <ChronicleMark className="size-6" />
          Chronicle
        </Link>
        <Link href="/landing" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Back to the site
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-10 sm:items-center sm:pt-0">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-card-foreground shadow-(--surface-shadow) sm:p-8 [&_[data-slot=field-separator-content]]:bg-card">{children}</div>
      </main>
      <p className="px-4 pb-6 text-center text-xs text-muted-foreground">{DEMO_NOTE}</p>
    </div>
  )
}

/** Layout 3: the art fills the screen and the form floats on it, with the pitch beside it on wide screens. */
export function AuthFullBleedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh flex-col bg-(--auth-panel) text-(--auth-panel-foreground)">
      <Image src={PANEL} alt="" fill sizes="100vw" className="-z-10 object-cover object-top-right" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-(--auth-panel) via-transparent to-transparent" />
      <header className="px-4 py-5 sm:px-10">
        <Link href="/landing" className="flex w-fit items-center gap-2 font-semibold tracking-tight">
          <ChronicleMark className="size-6" />
          Chronicle
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center gap-16 px-4 py-8 sm:px-10 lg:justify-between">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 text-card-foreground shadow-2xl ring-1 ring-black/5 sm:p-8 dark:ring-white/10 [&_[data-slot=field-separator-content]]:bg-card">{children}</div>
        <div className="hidden max-w-sm flex-col gap-6 lg:flex">
          <p className="text-4xl leading-tight font-semibold tracking-tight text-balance">Every number in Chronicle adds up.</p>
          <ul className="flex flex-col gap-3 text-sm opacity-80">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <p className="px-4 pb-6 text-center text-xs opacity-70 sm:px-10 lg:text-start">{DEMO_NOTE}</p>
    </div>
  )
}

/** The auth frame for a layout number, with the forms' links kept inside that layout. */
export function AuthFrame({ variant, children }: { variant: AuthVariant; children: React.ReactNode }) {
  const Shell = variant === 1 ? AuthShell : variant === 2 ? AuthCardShell : AuthFullBleedShell
  return (
    <AuthVariantProvider variant={variant}>
      <Shell>{children}</Shell>
    </AuthVariantProvider>
  )
}
