/**
 * Theme colours for shaders. A shader cannot read CSS variables, so the Kit
 * resolves any CSS colour (hex, `var(--primary)`, `oklch()`, `color-mix()`)
 * to sRGB channels 0..1 and passes them in as uniforms. Uniforms, not
 * `#define`s: a theme switch updates three floats instead of recompiling.
 */

export type Rgb = [number, number, number]

/** The event `CustomizerProvider` fires after it applies a new theme. */
export const THEME_CHANGE_EVENT = "kit-theme-change"

/** A plain `#rgb` or `#rrggbb` without touching the DOM, or null. */
export function parseHex(value: string): Rgb | null {
  const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) {
    return null
  }
  const hex = match[1].length === 3 ? match[1].replace(/./g, "$&$&") : match[1]
  return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255) as Rgb
}

let paint: CanvasRenderingContext2D | null | undefined

/**
 * Any CSS colour as sRGB, read where `host` sits (so tokens resolve with the
 * host's theme scope). The browser computes the colour; a 1x1 canvas turns
 * whatever space it computes into (oklch, color(srgb ...)) back into bytes.
 */
export function resolveCssColor(host: HTMLElement, color: string): Rgb {
  const hex = parseHex(color)
  if (hex) {
    return hex
  }
  const probe = document.createElement("span")
  probe.style.display = "none"
  probe.style.color = color
  host.appendChild(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()
  if (paint === undefined) {
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    paint = canvas.getContext("2d", { willReadFrequently: true })
  }
  if (!paint) {
    return [0, 0, 0]
  }
  paint.clearRect(0, 0, 1, 1)
  paint.fillStyle = computed
  paint.fillRect(0, 0, 1, 1)
  const [red, green, blue] = paint.getImageData(0, 0, 1, 1).data
  return [red / 255, green / 255, blue / 255]
}

/**
 * Calls `onChange` whenever the theme may have changed: light or dark (the
 * class on <html>), the customizer's preset, radius or imported CSS (its
 * event), or the OS colour scheme. Returns the unsubscribe function.
 */
export function watchTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
  const scheme = matchMedia("(prefers-color-scheme: dark)")
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  scheme.addEventListener("change", onChange)
  return () => {
    observer.disconnect()
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
    scheme.removeEventListener("change", onChange)
  }
}
