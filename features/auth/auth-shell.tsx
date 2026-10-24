import { CheckIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { ChronicleMark } from "@/components/chronicle/logo"

const POINTS = ["MRR, churn and retention on one reconciled model", "Users, tasks, mail and calendar in one workspace", "Light, dark and right to left, out of the box"]

/**
 * Chronicle's auth frame: a quiet slate panel beside the form on wide screens,
 * the form alone on small ones. The panel art is one 68 KB webp, no shader.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-(--auth-panel) p-10 text-(--auth-panel-foreground) lg:flex">
        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/auth/panel.webp`} alt="" fill sizes="42vw" className="-z-10 object-cover" />
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
        <p className="text-xs opacity-60">Demo mode: any email and a password of 8 or more characters will do.</p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <Link href="/landing" className="flex w-fit items-center gap-2 font-semibold tracking-tight lg:hidden">
          <ChronicleMark className="size-6" />
          Chronicle
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground lg:hidden">Demo mode: any email and a password of 8 or more characters will do.</p>
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
