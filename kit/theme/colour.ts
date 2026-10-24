/**
 * Just enough colour maths to check theme contrast: hex and `oklch()` values,
 * the two forms shadcn, tweakcn and the Kit's presets use. Used by tests, not at runtime.
 */

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

/** sRGB channels 0..1, or null for a value this module cannot read (var(), color-mix(), alpha). */
export function parseColour(value: string): [number, number, number] | null {
  value = value.trim()
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) {
    const hex = value.length === 4 ? value.slice(1).replace(/./g, "$&$&") : value.slice(1)
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
  }
  const match = value.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/)
  if (!match) {
    return null
  }
  const l = match[1].endsWith("%") ? parseFloat(match[1]) / 100 : Number(match[1])
  const c = Number(match[2])
  const h = Number(match[3])
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map((v) => fromLinear(Math.min(1, Math.max(0, v)))) as [number, number, number]
}

function toOklab([r, g, b]: [number, number, number]): [number, number, number] {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

function fromOklab([L, a, b]: [number, number, number]): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((v) =>
    fromLinear(Math.min(1, Math.max(0, v)))
  ) as [number, number, number]
}

/**
 * `top` at `amount` (0..1) over an opaque `base`, as Tailwind's `bg-x/15`
 * renders it (color-mix in oklab), as a hex string; null when unreadable.
 */
export function tint(top: string, amount: number, base: string): string | null {
  const a = parseColour(top)
  const b = parseColour(base)
  if (!a || !b) {
    return null
  }
  const [x, y] = [toOklab(a), toOklab(b)]
  const mixed = fromOklab([0, 1, 2].map((i) => x[i] * amount + y[i] * (1 - amount)) as [number, number, number])
  return "#" + mixed.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")
}

/** WCAG contrast ratio between two colours, or null when either cannot be read. */
export function contrast(first: string, second: string): number | null {
  const a = parseColour(first)
  const b = parseColour(second)
  if (!a || !b) {
    return null
  }
  const luminance = ([r, g, bl]: [number, number, number]) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(bl)
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}
