import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { parseThemeCss } from "@/kit/customizer/presets"
import { checkGlobalsCss, checkThemeContract, resolvePreset } from "@/kit/theme/contract"

import { THEME } from "./theme"

const root = new URL("../", import.meta.url).pathname
const css = readFileSync(join(root, "app/globals.css"), "utf8")
const globals = parseThemeCss(css)!

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(entry) && !entry.endsWith(".test.ts") ? [path] : []
  })
}

describe("Chronicle theme", () => {
  it("keeps globals.css ready for the Kit", () => {
    expect(checkGlobalsCss(css)).toEqual([])
  })

  it("puts its own slate theme first", () => {
    expect(THEME.presets[0]).toMatchObject({ id: "default", light: {}, dark: {} })
    expect(new Set(THEME.presets.map((preset) => preset.id)).size).toBe(THEME.presets.length)
  })

  it("restyles every surface in globals.css, not only the accent", () => {
    expect(globals.light).toMatchObject({ background: "oklch(0.974 0.006 255)", primary: "oklch(0.515 0.19 263)", sidebar: "oklch(0.962 0.008 255)", border: "oklch(0.905 0.012 258)" })
    expect(globals.dark).toMatchObject({ background: "oklch(0.165 0.016 264)", primary: "oklch(0.67 0.16 262)" })
  })

  it.each(THEME.presets.map((preset) => [preset.id, preset] as const))("%s keeps the Kit theme contract in both modes", (_, preset) => {
    expect(checkThemeContract(resolvePreset(globals, preset))).toEqual([])
  })

  it("draws only from theme tokens, never fixed colours or the faint ramp ends", () => {
    for (const dir of ["features", "components/chronicle"]) {
      let files: string[] = []
      try {
        files = sourceFiles(join(root, dir))
      } catch {
        continue
      }
      for (const file of files) {
        const source = readFileSync(file, "utf8")
        expect(source, file).not.toMatch(/chart-[45]\b/)
        expect(source, file).not.toMatch(/#[0-9a-f]{6}\b|rgb\(|oklch\(/i)
      }
    }
  })
})
