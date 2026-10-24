"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  icon?: React.ComponentType
  /** Accessible name when the label is an icon only. */
  ariaLabel?: string
}

/**
 * Where the pressed option sits inside the track, kept in sync on resize.
 * `ready` stays false for the first measurement, so the pill appears in place
 * instead of sliding in from the corner.
 */
function usePressedRect(track: React.RefObject<HTMLDivElement | null>, value: string) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const node = track.current
    if (!node) {
      return
    }
    const measure = () => {
      const pressed = node.querySelector<HTMLElement>('[aria-pressed="true"]')
      setRect(pressed ? { left: pressed.offsetLeft, top: pressed.offsetTop, width: pressed.offsetWidth, height: pressed.offsetHeight } : null)
    }
    measure()
    const frame = requestAnimationFrame(() => setReady(true))
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [track, value])

  return { rect, ready }
}

type Rect = { left: number; top: number; width: number; height: number }

/**
 * Slides the pill from where it was with the Web Animations API, not a CSS
 * transition: a colour-mode switch runs under next-themes'
 * `transition: none !important`, which would make the pill jump.
 */
function useSlide(pill: React.RefObject<HTMLSpanElement | null>, rect: Rect | null, ready: boolean) {
  const previous = useRef<Rect | null>(null)

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = rect
    const node = pill.current
    if (!node || !rect || !from || !ready || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    if (from.left === rect.left && from.top === rect.top && from.width === rect.width && from.height === rect.height) {
      return
    }
    node.animate(
      [
        { translate: `${from.left}px ${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
        { translate: `${rect.left}px ${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` },
      ],
      { duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    )
  }, [pill, rect, ready])
}

/**
 * A segmented control: a muted track with the selected option raised on a
 * pill that slides between options. Built on ToggleGroup, so it keeps roving
 * focus and arrow-key navigation.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  size?: "sm" | "default"
  className?: string
  "aria-label"?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const { rect, ready } = usePressedRect(track, value)
  useSlide(pill, rect, ready)

  return (
    <ToggleGroup
      ref={track}
      aria-label={ariaLabel}
      size={size}
      spacing={0}
      className={cn("relative w-full rounded-lg bg-muted p-0.5", className)}
      value={[value]}
      onValueChange={(next) => {
        if (next[0]) {
          onChange(next[0] as T)
        }
      }}
    >
      {rect && (
        <span
          ref={pill}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 rounded-md bg-background shadow-sm dark:bg-input/50"
          // Position is measured, so it is data.
          style={{ translate: `${rect.left}px ${rect.top}px`, width: rect.width, height: rect.height }}
        />
      )}
      {options.map((option) => {
        const Icon = option.icon
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.ariaLabel}
            className="relative z-10 min-w-fit flex-1 rounded-md! text-muted-foreground transition-colors duration-250 hover:bg-transparent hover:text-foreground aria-pressed:bg-transparent aria-pressed:text-foreground"
          >
            {Icon && <Icon />}
            {option.label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
