import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { contrast, parseColour } from "./colour"
import { checkGlobalsCss, checkThemeContract, REQUIRED_TOKENS, resolvePreset } from "./contract"
import { LIBRARY_PRESETS } from "./library"
import { NEUTRAL_THEME } from "./neutral"

const root = new URL("../../", import.meta.url).pathname

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(tsx?|css)$/.test(entry) && !entry.endsWith(".test.ts") ? [path] : []
  })
}

describe("colour maths", () => {
  it("reads hex and oklch, and skips what it cannot read", () => {
    expect(parseColour("#ffffff")).toEqual([1, 1, 1])
    expect(parseColour("oklch(1 0 0)")?.map((v) => Math.round(v * 100) / 100)).toEqual([1, 1, 1])
    expect(parseColour("var(--primary)")).toBeNull()
    expect(contrast("#000", "#fff")).toBeCloseTo(21, 0)
  })
})

describe("theme contract", () => {
  it("passes for the neutral reference theme", () => {
    expect(checkThemeContract(resolvePreset(NEUTRAL_THEME))).toEqual([])
  })

  it("reports a missing token and a failing contrast pair", () => {
    const broken = resolvePreset(NEUTRAL_THEME, { light: { "muted-foreground": "oklch(0.8 0 0)" }, dark: {} })
    delete broken.light.sidebar
    const problems = checkThemeContract(broken)
    expect(problems).toContain("light: --sidebar is missing")
    expect(problems.some((problem) => problem.startsWith("light: --muted-foreground on --background"))).toBe(true)
  })

  it("checks status text on its tint, as StatusBadge draws it", () => {
    const pale = resolvePreset(NEUTRAL_THEME, { light: { success: "oklch(0.85 0.1 152)" }, dark: {} })
    expect(checkThemeContract(pale).some((problem) => problem.startsWith("light: --success on a 15% --success tint"))).toBe(true)
  })

  it("lets dark mode inherit light tokens it does not override", () => {
    const resolved = resolvePreset({ light: { primary: "a", card: "b" }, dark: { card: "c" } }, { light: { primary: "d" }, dark: {} })
    expect(resolved.dark).toEqual({ primary: "d", card: "c" })
  })

  it("lists every shadcn colour token plus the Kit status tokens", () => {
    expect(REQUIRED_TOKENS).toContain("sidebar-ring")
    expect(REQUIRED_TOKENS).toContain("success-foreground")
  })
})

describe("globals.css check", () => {
  const good = '@import "tailwindcss";\n@import "../kit/kit.css";\n@theme inline { --color-card: var(--card); }'
  it("passes a globals.css that imports kit.css and leaves --font-heading to it", () => {
    expect(checkGlobalsCss(good)).toEqual([])
    expect(checkGlobalsCss(good + "\n/* --font-heading: kit.css owns it */")).toEqual([])
  })
  it("catches shadcn init's --font-heading, which would override --heading-font", () => {
    expect(checkGlobalsCss(good.replace("--color-card", "--font-heading: var(--font-sans); --color-card"))[0]).toContain("--font-heading")
  })
  it("catches a missing kit.css import", () => {
    expect(checkGlobalsCss('@import "tailwindcss";')[0]).toContain("kit/kit.css")
  })
})

describe("library presets", () => {
  it("ships eight with unique ids", () => {
    expect(LIBRARY_PRESETS).toHaveLength(8)
    expect(new Set(LIBRARY_PRESETS.map((preset) => preset.id)).size).toBe(8)
  })

  it.each(LIBRARY_PRESETS.map((preset) => [preset.id, preset] as const))("%s keeps the contract over the neutral base", (_, preset) => {
    expect(checkThemeContract(resolvePreset(NEUTRAL_THEME, preset))).toEqual([])
  })
})

describe("kit source", () => {
  const files = sourceFiles(join(root, "kit"))

  it("names no template, store or place", () => {
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/emporium|wren|alder\b|portland|rapport/i)
    }
  })

  it("draws charts only from theme tokens, never fixed colours or the faint ramp ends", () => {
    for (const file of files.filter((path) => /kit\/(charts|widgets|organization|settings)\//.test(path))) {
      const source = readFileSync(file, "utf8")
      // chart-4 and chart-5 sit next to the card colour in shadcn's dark ramp.
      expect(source, file).not.toMatch(/chart-[45]\b/)
      expect(source, file).not.toMatch(/(?:stroke|fill|stopColor|color)=["']#[0-9a-f]{3,8}["']/i)
    }
  })

  it("uses no raw colours in components", () => {
    // Google's mark keeps its own colours; an example in a placeholder is text, not styling.
    for (const file of files.filter((path) => path.endsWith(".tsx") && !path.endsWith("brand-marks.tsx"))) {
      const source = readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => !line.includes("placeholder="))
        .join("\n")
      expect(source, file).not.toMatch(/#[0-9a-f]{6}\b|\boklch\(|\brgba?\(/i)
    }
  })
})
