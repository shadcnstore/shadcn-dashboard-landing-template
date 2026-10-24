import { buildThemeCss, fontVariables, SCALE_SIZES, STORAGE_KEY, type KitTheme } from "./settings"

/**
 * Applies saved customizer settings before the first paint, so a visitor who
 * picked a different preset never sees the default flash first. Render it in
 * the root layout's <head>. The provider removes the boot style once React
 * owns the theme.
 */
export function CustomizerScript({ theme }: { theme: KitTheme }) {
  const presets = theme.presets.map(({ id, light, dark }) => ({ id, light, dark }))
  const source = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(!raw)return;var saved=JSON.parse(raw).state;if(!saved)return;var build=${buildThemeCss.toString()};var style=document.createElement("style");style.id="kit-customizer-boot";style.textContent=build(saved,${JSON.stringify(presets)},${JSON.stringify(fontVariables(theme.fonts))},${JSON.stringify(SCALE_SIZES)});document.head.appendChild(style);if(saved.direction)document.documentElement.dir=saved.direction;}catch(e){}})()`
  return <script id="kit-customizer-script" dangerouslySetInnerHTML={{ __html: source }} />
}
