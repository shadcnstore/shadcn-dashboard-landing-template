import { buildThemeCss, fontVariables, SCALE_SIZES, STORAGE_KEY, type KitTheme } from "./settings"

/**
 * The boot script as source text: reads the saved settings and writes their
 * CSS before the first paint. `CustomizerScript` inlines it in a Next.js
 * root layout; a Vite app runs it from its entry before rendering
 * (`bootCustomizer`).
 */
export function customizerScriptSource(theme: KitTheme): string {
  const presets = theme.presets.map(({ id, light, dark }) => ({ id, light, dark }))
  return `(function(){try{var raw=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(!raw)return;var saved=JSON.parse(raw).state;if(!saved)return;var build=${buildThemeCss.toString()};var style=document.createElement("style");style.id="kit-customizer-boot";style.textContent=build(saved,${JSON.stringify(presets)},${JSON.stringify(fontVariables(theme.fonts))},${JSON.stringify(SCALE_SIZES)});document.head.appendChild(style);if(saved.direction)document.documentElement.dir=saved.direction;}catch(e){}})()`
}

/**
 * Applies saved customizer settings before the first paint, so a visitor who
 * picked a different preset never sees the default flash first. Render it in
 * the root layout's <head>. The provider removes the boot style once React
 * owns the theme.
 */
export function CustomizerScript({ theme }: { theme: KitTheme }) {
  return <script id="kit-customizer-script" dangerouslySetInnerHTML={{ __html: customizerScriptSource(theme) }} />
}

/**
 * The same boot for a client-rendered app (Vite): call it in the entry file
 * before `createRoot(...).render(...)`. Nothing is on screen yet, so the saved
 * preset is in place for the first paint.
 */
export function bootCustomizer(theme: KitTheme): void {
  if (document.getElementById("kit-customizer-script")) {
    return
  }
  const script = document.createElement("script")
  script.id = "kit-customizer-script"
  script.text = customizerScriptSource(theme)
  document.head.appendChild(script)
}
