"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

const PARTICLES = 8

interface Particle {
  x: number
  y: number
  duration: number
  delay: number
  size: number
  endScale: number
}

/** Eight dots flung outward at slightly random angles, distances and speeds, so no two bursts look alike. */
function spray(distance = 20): Particle[] {
  return Array.from({ length: PARTICLES }, (_, index) => {
    const angle = (index / PARTICLES) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const reach = distance * (0.8 + Math.random() * 0.5)
    return {
      x: Math.cos(angle) * reach,
      y: Math.sin(angle) * reach,
      duration: 500 + Math.random() * 200,
      delay: Math.random() * 40,
      size: 0.8 + Math.random() * 0.6,
      endScale: 0.3 + Math.random() * 0.4,
    }
  })
}

function HeartGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * A heart that fills, springs, and throws a small burst of particles when
 * liked (transitions.dev "like-button"). Unliking only empties the heart: the
 * celebration is for the positive action. The burst is decoration, so the
 * state is carried by aria-pressed and the label, never by motion alone.
 */
export function LikeButton({
  liked,
  onLikedChange,
  label,
  count,
  icon: Icon = HeartGlyph,
  className,
}: {
  liked: boolean
  onLikedChange: (liked: boolean) => void
  /** Visible text beside the heart, e.g. "Helpful". Without it, pass an aria-label via `label`. */
  label: React.ReactNode
  count?: number
  /** Swap the heart for another 24px stroke glyph (a star, a thumb). */
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  const [burst, setBurst] = useState<{ id: number; particles: Particle[] } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggle = () => {
    const next = !liked
    onLikedChange(next)
    if (!next) {
      return
    }
    if (timer.current) {
      clearTimeout(timer.current)
    }
    // A new id remounts the dots, so a fast unlike-like restarts the burst.
    setBurst({ id: Date.now(), particles: spray() })
    timer.current = setTimeout(() => setBurst(null), 900)
  }

  return (
    <button
      type="button"
      aria-pressed={liked}
      data-liked={liked}
      onClick={toggle}
      className={cn(
        "group/like inline-flex h-7 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-[color,background-color,border-color,scale] duration-150 ease-smooth-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 data-[liked=true]:border-like/30 data-[liked=true]:bg-like/10 data-[liked=true]:text-like",
        className
      )}
    >
      <span className="relative grid size-3.5 place-items-center">
        {/* The pop lives on this wrapper, never on the <svg>: a transformed inline SVG rasterises blurry in Chromium. */}
        <span className="grid size-full place-items-center group-data-[liked=true]/like:animate-like-pop">
          <Icon className="size-full fill-transparent stroke-current transition-[fill] duration-150 ease-smooth-out group-data-[liked=true]/like:fill-current" />
        </span>
        {burst && (
          <span key={burst.id} className="pointer-events-none absolute start-1/2 top-1/2 size-0 text-like" aria-hidden>
            {burst.particles.map((particle, index) => (
              <i
                key={index}
                className="absolute -start-[calc(var(--psize)/2)] -top-[calc(var(--psize)/2)] size-(--psize) animate-like-burst rounded-full bg-current opacity-0"
                style={
                  {
                    "--px": `${particle.x}px`,
                    "--py": `${particle.y}px`,
                    "--psize": `${2.5 * particle.size}px`,
                    "--p-end-scale": particle.endScale,
                    animationDuration: `${particle.duration}ms`,
                    animationDelay: `${particle.delay}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        )}
      </span>
      {label}
      {count !== undefined && <span className="font-mono tabular-nums">{count + (liked ? 1 : 0)}</span>}
    </button>
  )
}
