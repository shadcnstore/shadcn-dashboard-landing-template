"use client"

import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { Link } from "../framework"

export interface WizardStep {
  id: string
  title: string
  description: string
}

/**
 * A full-screen, multi-step setup: the step list on the left, one step's form
 * on the right, and Back / Skip / Continue at the bottom. The template
 * supplies the steps; the frame handles progress and navigation.
 */
export function Wizard({
  brand,
  steps,
  current,
  completed,
  onSelect,
  onBack,
  onSkip,
  onContinue,
  continueLabel = "Continue",
  continuing = false,
  canContinue = true,
  exitHref = "/",
  children,
}: {
  brand: React.ReactNode
  steps: WizardStep[]
  current: number
  /** Ids of steps already done; they can be revisited from the list. */
  completed: string[]
  onSelect: (index: number) => void
  onBack: () => void
  /** Omit on steps that cannot be skipped. */
  onSkip?: () => void
  onContinue: () => void
  continueLabel?: string
  continuing?: boolean
  canContinue?: boolean
  exitHref?: string
  children: React.ReactNode
}) {
  const step = steps[current]
  const progress = (completed.length / steps.length) * 100
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[20rem_1fr]">
      <aside className="flex flex-col gap-8 border-b bg-muted/40 p-6 lg:border-e lg:border-b-0 lg:p-8">
        <div className="flex items-center justify-between">
          {brand}
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={exitHref} />}>
            Finish later
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {completed.length} of {steps.length} done
          </span>
          <Progress value={progress} aria-label="Setup progress" />
        </div>
        <ol className="hidden flex-col gap-1 lg:flex">
          {steps.map((entry, index) => {
            const done = completed.includes(entry.id)
            const active = index === current
            const reachable = done || active || index <= completed.length
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => onSelect(index)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg p-2 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:bg-muted disabled:opacity-50",
                    active && "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && !done && "border-primary text-primary"
                    )}
                  >
                    {done ? <CheckIcon className="size-3.5" /> : index + 1}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{entry.description}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </aside>
      <section className="flex flex-col">
        <div className="flex flex-1 justify-center p-6 lg:p-12">
          <div className="flex w-full max-w-xl flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                Step {current + 1} of {steps.length}
              </span>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">{step.title}</h1>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            {children}
          </div>
        </div>
        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t bg-background/95 px-6 py-4 backdrop-blur lg:px-12">
          <Button variant="ghost" onClick={onBack} disabled={current === 0 || continuing}>
            Back
          </Button>
          <div className="flex gap-2">
            {onSkip && (
              <Button variant="outline" onClick={onSkip} disabled={continuing}>
                Skip for now
              </Button>
            )}
            <Button onClick={onContinue} disabled={!canContinue || continuing}>
              {continuing && <Spinner data-icon="inline-start" />}
              {continueLabel}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
