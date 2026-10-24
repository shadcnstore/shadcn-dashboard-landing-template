import type { ThemePreset, TokenMap } from "../customizer/presets"
import { contrast, tint } from "./colour"

/**
 * The theme contract. A template's default theme (the `:root` and `.dark`
 * blocks of its globals.css) must define every one of these, in both modes
 * where they differ, so every Kit surface takes the template's look.
 */
export const REQUIRED_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "info",
  "info-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const

/**
 * Surface tokens the Kit adds on top of shadcn's, with the defaults in
 * `kit/kit.css`. A template overrides any of them to restyle the canvas,
 * the cards and the headings, not only the colours.
 */
export const SURFACE_TOKENS = {
  page: "The content canvas behind cards. Default: muted at 40%.",
  "surface-shadow": "The soft card shadow on widgets and settings cards, used as shadow-(--surface-shadow). Default: Tailwind's shadow-xs.",
  "surface-shadow-raised": "A raised card such as the highlighted plan, used as shadow-(--surface-shadow-raised). Default: Tailwind's shadow-md.",
  "heading-font": "Page, card and hero titles. Default: the UI font. Never redefine --font-heading in the template's @theme.",
  "auth-panel": "The auth brand panel's base, under the shader. Default: black.",
  "auth-panel-foreground": "Text and hairlines on the auth panel. Default: white.",
  "auth-panel-live": "The live dot on the auth panel. Default: emerald.",
  "auth-panel-rating": "Testimonial stars on the auth panel. Default: amber.",
  "auth-panel-image": "Backing behind activity photos on the auth panel. Default: white.",
  "chart-lead": "The lead chart series. Default: the primary colour.",
  "chart-line": "A line drawn over lead columns. Default: lead mixed halfway to the text colour.",
} as const

export interface ResolvedTheme {
  light: TokenMap
  dark: TokenMap
}

/**
 * What a preset looks like once the customizer applies it over the
 * template's globals.css, in each mode. Mirrors the CSS cascade: the `.dark`
 * block sits over `:root`, then the customizer's `html:root` block (light
 * tokens) beats both, then `html:root.dark` (dark tokens).
 */
export function resolvePreset(base: ResolvedTheme, preset?: Pick<ThemePreset, "light" | "dark">): ResolvedTheme {
  return {
    light: { ...base.light, ...preset?.light },
    dark: { ...base.light, ...base.dark, ...preset?.light, ...preset?.dark },
  }
}

function value(tokens: TokenMap, name: string): string {
  const raw = tokens[name]
  const reference = raw?.match(/^var\(--([a-z0-9-]+)\)$/)
  return reference ? value(tokens, reference[1]) : raw
}

/**
 * Problems in a template's globals.css that no token check can see:
 * kit.css not imported, or `--font-heading` redefined in the template's own
 * `@theme` (shadcn init writes `--font-heading: var(--font-sans);`), which
 * overrides the Kit's mapping to `--heading-font` and silently disables it.
 */
export function checkGlobalsCss(css: string): string[] {
  const problems: string[] = []
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "")
  if (!/@import\s+["'][^"']*kit\/kit\.css["']/.test(withoutComments)) {
    problems.push('globals.css does not import kit/kit.css (add @import "../kit/kit.css"; after shadcn/tailwind.css)')
  }
  if (/--font-heading\s*:/.test(withoutComments)) {
    problems.push("globals.css redefines --font-heading; delete it and set --heading-font instead (kit.css maps one to the other)")
  }
  return problems
}

/**
 * Every way a resolved theme breaks the contract: a missing token, or text
 * and chart colours below WCAG on the surfaces the Kit draws them on. Values
 * this checker cannot read (color-mix, alpha) are skipped, not failed.
 * Returns an empty list when the theme passes.
 */
export function checkThemeContract(theme: ResolvedTheme): string[] {
  const problems: string[] = []
  for (const mode of ["light", "dark"] as const) {
    const tokens = theme[mode]
    for (const name of REQUIRED_TOKENS) {
      if (!tokens[name]) {
        problems.push(`${mode}: --${name} is missing`)
      }
    }
    const pairs: [string, string, number][] = [
      ["foreground", "background", 4.5],
      ["card-foreground", "card", 4.5],
      ["primary-foreground", "primary", 4.5],
      ["muted-foreground", "background", 4.5],
      ["muted-foreground", "card", 4.5],
      ["muted-foreground", "muted", 4.5],
      ["destructive", "card", 4.5],
      ["sidebar-foreground", "sidebar", 4.5],
      // Further chart series must be told apart from the card they sit on.
      ["chart-2", "card", 2],
      ["chart-3", "card", 2],
    ]
    for (const [text, surface, minimum] of pairs) {
      const ratio = contrast(value(tokens, text) ?? "", value(tokens, surface) ?? "")
      if (ratio !== null && ratio < minimum) {
        problems.push(`${mode}: --${text} on --${surface} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`)
      }
    }
    // Status text as the Kit draws it: StatusBadge and IconTile put the status colour (or, for
    // warning in light mode, its foreground) on a 15 to 20% tint of itself over the card.
    const card = value(tokens, "card") ?? ""
    const statusPairs: [string, string, number][] = [
      ["success", "success", 0.15],
      ["info", "info", 0.15],
      [mode === "light" ? "warning-foreground" : "warning", "warning", 0.2],
    ]
    for (const [text, surface, amount] of statusPairs) {
      const background = tint(value(tokens, surface) ?? "", amount, card)
      const ratio = background ? contrast(value(tokens, text) ?? "", background) : null
      if (ratio !== null && ratio < 4.5) {
        problems.push(`${mode}: --${text} on a ${amount * 100}% --${surface} tint is ${ratio.toFixed(2)}:1, needs 4.5:1`)
      }
    }
    const lead = value(tokens, "chart-lead") ?? value(tokens, "primary")
    const ratio = contrast(lead ?? "", value(tokens, "card") ?? "")
    if (ratio !== null && ratio < 3) {
      problems.push(`${mode}: chart lead on --card is ${ratio.toFixed(2)}:1, needs 3:1`)
    }
  }
  return problems
}
