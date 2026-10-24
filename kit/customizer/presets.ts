/**
 * Theme presets. Each template passes its own list to the customizer (see
 * `KitTheme` in ./settings): its own default first, then any extras, such as
 * the tweakcn library in `kit/theme/library`. Values are shadcn CSS variables
 * without the leading `--`.
 */

export type TokenMap = Record<string, string>

export interface ThemePreset {
  id: string
  name: string
  /** Primary, secondary, accent and muted (light mode), shown in the customizer. */
  swatches: readonly string[]
  /** The corner radius the theme was designed with. */
  radius: string
  /** Tokens laid over the template's `globals.css`. The template's own default is usually empty here. */
  light: TokenMap
  dark: TokenMap
}

/** The preset with this id, or the first one (the template's default). */
export function findPreset(presets: readonly ThemePreset[], id: string): ThemePreset {
  return presets.find((preset) => preset.id === id) ?? presets[0]
}

/**
 * Reads `--token: value;` pairs out of pasted theme CSS. Accepts what
 * `shadcn/create`, tweakcn and hand-written themes produce: a `:root { }` block
 * for light and a `.dark { }` block for dark. Anything else is ignored.
 */
export function parseThemeCss(css: string): { light: TokenMap; dark: TokenMap } | null {
  const block = (selector: RegExp) => {
    const match = css.match(selector)
    if (!match) {
      return {}
    }
    const tokens: TokenMap = {}
    for (const [, name, value] of match[1].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      tokens[name.trim()] = value.trim()
    }
    return tokens
  }
  const light = block(/:root\s*\{([^}]*)\}/)
  const dark = block(/\.dark\s*\{([^}]*)\}/)
  if (Object.keys(light).length === 0 && Object.keys(dark).length === 0) {
    return null
  }
  return { light, dark }
}

/** The CSS a buyer pastes into globals.css to keep the current look. */
export function themeCss(light: TokenMap, dark: TokenMap, radius: string): string {
  const lines = (tokens: TokenMap) =>
    Object.entries(tokens)
      .map(([name, value]) => `  --${name}: ${value};`)
      .join("\n")
  return `:root {\n  --radius: ${radius};\n${lines(light)}\n}\n\n.dark {\n${lines(dark)}\n}\n`
}
