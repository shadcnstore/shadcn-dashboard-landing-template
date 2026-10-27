import NextLink from "next/link"
import { useParams as useNextParams, usePathname as useNextPathname, useRouter as useNextRouter, useSearchParams as useNextSearchParams } from "next/navigation"
import NextScript from "next/script"

import type { InlineScriptProps, KitLink, KitParams, KitRouter, KitSearchParams } from "./types"

export type { InlineScriptProps, KitLink, KitLinkProps, KitParams, KitRouter, KitSearchParams } from "./types"

/*
 * The Next.js (App Router) adapter. Every export is Next's own, typed down to
 * the Kit's contract in ./types, so a Next.js template behaves exactly as if
 * it imported next/link and next/navigation itself.
 */

export const Link: KitLink = NextLink
export const usePathname: () => string = useNextPathname
export const useParams: () => KitParams = useNextParams
export const useSearchParams: () => KitSearchParams = useNextSearchParams
export const useRouter: () => KitRouter = useNextRouter

/** The app's base path (`basePath` in next.config), e.g. "/chronicle" on the demo host, or "". */
export function useBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? ""
}

/** An inline script that runs once after hydration (next/script, afterInteractive). */
export function InlineScript({ id, children }: InlineScriptProps) {
  return (
    <NextScript id={id} strategy="afterInteractive">
      {children}
    </NextScript>
  )
}
