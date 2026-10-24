/**
 * Run `task` once the browser is idle after first paint (2 s at the latest).
 * Used to fetch lazily loaded panels before anyone opens them, so the first
 * open is instant and keys typed right after ⌘K reach the palette.
 */
export function whenIdle(task: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  if ("requestIdleCallback" in window) {
    const handle = window.requestIdleCallback(task, { timeout: 2000 })
    return () => window.cancelIdleCallback(handle)
  }
  const timer = setTimeout(task, 1200)
  return () => clearTimeout(timer)
}
