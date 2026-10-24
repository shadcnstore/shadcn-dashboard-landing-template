import type { ThemePreset } from "./presets"

/** A font id from the template's `KitTheme.fonts`. */
export type Font = string
export type Scale = "sm" | "md" | "lg"
export type ContentWidth = "full" | "contained"
export type SidebarVariant = "sidebar" | "floating" | "inset"
export type SidebarCollapsible = "offcanvas" | "icon"
export type Layout = "sidebar" | "top"
export type Direction = "ltr" | "rtl"

export interface CustomizerSettings {
  preset: string
  /** Tokens imported from pasted CSS; overrides the preset when set. */
  custom: { light: Record<string, string>; dark: Record<string, string> } | null
  radius: string
  font: Font
  scale: Scale
  contentWidth: ContentWidth
  sidebarVariant: SidebarVariant
  sidebarCollapsible: SidebarCollapsible
  layout: Layout
  direction: Direction
}

/** A UI font the customizer offers. `variable` is what `--font-sans` becomes, e.g. "var(--font-geist)". */
export interface FontOption {
  id: string
  label: string
  variable: string
}

/**
 * Everything a template tells the customizer about its look: where it starts,
 * which presets it offers (its own default first) and which fonts.
 */
export interface KitTheme {
  defaults: CustomizerSettings
  presets: readonly ThemePreset[]
  fonts: readonly FontOption[]
}

/** Checks a template's theme config at startup, so a typo fails loudly instead of rendering the wrong theme. */
export function defineTheme(theme: KitTheme): KitTheme {
  if (theme.presets.length === 0 || theme.fonts.length === 0) {
    throw new Error("KitTheme needs at least one preset and one font.")
  }
  if (!theme.presets.some((preset) => preset.id === theme.defaults.preset)) {
    throw new Error(`KitTheme default preset "${theme.defaults.preset}" is not in presets.`)
  }
  if (!theme.fonts.some((font) => font.id === theme.defaults.font)) {
    throw new Error(`KitTheme default font "${theme.defaults.font}" is not in fonts.`)
  }
  return theme
}

export const STORAGE_KEY = "kit-customizer"

export const RADII = ["0rem", "0.3rem", "0.5rem", "0.625rem", "0.875rem"] as const

export const SCALE_SIZES: Record<Scale, string> = { sm: "15px", md: "16px", lg: "17px" }

/** Font id to CSS variable, the shape `buildThemeCss` takes. */
export function fontVariables(fonts: readonly FontOption[]): Record<string, string> {
  return Object.fromEntries(fonts.map((font) => [font.id, font.variable]))
}

/**
 * Builds the CSS the customizer injects. It must stay self-contained (no
 * references outside its body): the same function source runs in the inline
 * script that applies saved settings before first paint. An unknown font falls
 * back to the first one the template lists.
 */
export function buildThemeCss(
  settings: Pick<CustomizerSettings, "preset" | "custom" | "radius" | "font" | "scale">,
  presets: { id: string; light: Record<string, string>; dark: Record<string, string> }[],
  fonts: Record<string, string>,
  sizes: Record<string, string>
): string {
  const preset = presets.find((candidate) => candidate.id === settings.preset) || presets[0]
  const light = settings.custom ? settings.custom.light : preset.light
  const dark = settings.custom ? settings.custom.dark : preset.dark
  const lines = (tokens: Record<string, string>) =>
    Object.keys(tokens)
      .map((name) => "--" + name + ":" + tokens[name] + ";")
      .join("")
  return (
    "html:root{--radius:" +
    settings.radius +
    ";--font-sans:" +
    (fonts[settings.font] || fonts[Object.keys(fonts)[0]]) +
    ";font-size:" +
    (sizes[settings.scale] || "16px") +
    ";" +
    lines(light) +
    "}html:root.dark{" +
    lines(dark) +
    "}"
  )
}
