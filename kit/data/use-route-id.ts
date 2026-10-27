"use client"

import { useSyncExternalStore } from "react"

import { useParams, usePathname } from "../framework"

/**
 * The id of the record a detail page shows, e.g. `1042` on `/orders/1042`.
 *
 * In a normal build this is simply the route param. The static demo
 * pre-renders one placeholder page per detail route (`/orders/_`) and the web
 * server serves it for every id, so there the param is always `_` and the real
 * id comes from the pathname instead. The pathname is only trusted after
 * hydration: the pre-rendered HTML was built for `_`, so the first client
 * render must match it, which is why this returns `null` until then.
 *
 * Detail routes keep the id as the last path segment.
 */
export const PLACEHOLDER_ID = "_"

const noop = () => () => {}

function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}

export function useRouteId(param = "id"): string | null {
  const params = useParams()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const fromRoute = (params[param] as string | undefined) ?? null

  if (fromRoute !== null && fromRoute !== PLACEHOLDER_ID) {
    return fromRoute
  }
  if (!hydrated) {
    return null
  }
  return decodeURIComponent(pathname.replace(/\/$/, "").split("/").pop() ?? "") || null
}
