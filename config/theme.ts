import { defineTheme } from "@/kit/customizer/settings"
import { LIBRARY_PRESETS } from "@/kit/theme/library"

/**
 * Chronicle's look, as the Kit customizer sees it. The default preset is the
 * slate and cobalt theme in app/globals.css, so its token lists are empty; the
 * Kit's library presets restyle every surface for anyone who wants another
 * world. `config/theme.test.ts` checks every preset against the Kit contract.
 */
export const THEME = defineTheme({
  defaults: {
    preset: "default",
    custom: null,
    radius: "0.625rem",
    font: "hanken",
    scale: "md",
    contentWidth: "full",
    sidebarVariant: "inset",
    sidebarCollapsible: "icon",
    layout: "sidebar",
    direction: "ltr",
  },
  presets: [
    {
      id: "default",
      name: "Chronicle",
      swatches: ["oklch(0.515 0.19 263)", "oklch(0.215 0.028 264)", "oklch(0.974 0.006 255)", "oklch(0.62 0.12 228)"],
      radius: "0.625rem",
      light: {},
      dark: {},
    },
    ...LIBRARY_PRESETS,
  ],
  fonts: [
    { id: "hanken", label: "Hanken Grotesk", variable: "var(--font-hanken)" },
    { id: "system", label: "System UI", variable: "ui-sans-serif, system-ui, sans-serif" },
  ],
})
