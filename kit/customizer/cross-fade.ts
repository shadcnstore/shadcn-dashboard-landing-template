import { flushSync } from "react-dom"

/**
 * Runs a whole-page change (theme preset, light or dark) inside a view
 * transition, so the page cross-fades instead of repainting at once. Falls
 * back to an instant change where unsupported or when motion is reduced.
 */
export function crossFade(change: () => void) {
  if (typeof document.startViewTransition !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    change()
    return
  }
  document.startViewTransition(() => flushSync(change))
}
