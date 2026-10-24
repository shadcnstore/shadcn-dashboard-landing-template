import type { ThemePreset } from "../customizer/presets"
import { GENERATED_PRESETS } from "./library-generated"

/**
 * Eight tweakcn themes (Apache-2.0) that restyle every surface, contrast-fixed
 * by `bin/build-theme-presets.mjs`. A template offers them after its own
 * default: `presets: [myDefault, ...LIBRARY_PRESETS]`. See docs/theming.md.
 */
export const LIBRARY_PRESETS: ThemePreset[] = GENERATED_PRESETS.map((preset) => ({
  id: preset.id,
  name: preset.name,
  swatches: preset.swatches,
  radius: preset.radius,
  light: { ...preset.light },
  dark: { ...preset.dark },
}))
