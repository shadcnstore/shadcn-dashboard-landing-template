"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * True while the media query matches. The server and the first client render
 * assume the wide layout, then the real width takes over, so hydration never
 * mismatches. Shared by the Mail and Chat split panes.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    [query]
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true
  )
}

/**
 * The height that makes an app fill the shell's content area: the viewport
 * minus the 56px header and the content padding (plus the inset sidebar's
 * 8px margins from md up). Never shorter than a usable 520px.
 */
export const APP_HEIGHT = "h-[calc(100svh-5.5rem)] min-h-[520px] md:h-[calc(100svh-7.5rem)]"
