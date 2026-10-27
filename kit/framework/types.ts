import type { AnchorHTMLAttributes, ReactNode, Ref } from "react"

/**
 * The contract between the Kit and the app framework it runs in. Kit files
 * import routing only from `kit/framework` (never `next/*` or `react-router`),
 * and each framework's adapter implements exactly these exports:
 *
 * - `framework/index.tsx`: Next.js (App Router). The default edition.
 * - `framework/react-router.tsx`: Vite + React Router. `kit-sync --framework vite`
 *   writes it as `framework/index.tsx`, so Kit code never changes.
 *
 * Anything beyond this list (prefetch, refresh, object hrefs) is framework
 * specific and stays out of `kit/`.
 */

/** An in-app link: an anchor with a string href, routed client-side. */
export interface KitLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string
  /** Replace the current history entry instead of adding one. */
  replace?: boolean
  ref?: Ref<HTMLAnchorElement>
}

export type KitLink = (props: KitLinkProps) => ReactNode

/**
 * Navigation. An href is an app path without the base path (client-side), or
 * an absolute URL such as `https://…` (a full page load, under both adapters).
 */
export interface KitRouter {
  push(href: string): void
  replace(href: string): void
  back(): void
}

/** Read-only query string of the current URL. */
export interface KitSearchParams {
  get(name: string): string | null
  has(name: string): boolean
  toString(): string
}

/** Dynamic route segments, e.g. `{ id: "1042" }` on `/orders/1042`. */
export type KitParams = Readonly<Record<string, string | string[] | undefined>>

/** Props of the inline script the demo build uses for analytics. */
export interface InlineScriptProps {
  id: string
  /** Script source, run once after the page is interactive. */
  children: string
}
