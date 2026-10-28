import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

/*
 * Newer shadcn sidebars ship SidebarMenu with gap-0, so an active item and the
 * hovered item next to it painted one continuous block. Every multi-item menu
 * list in the shell keeps a 2px gap (sub-menus already have gap-1 upstream).
 */
describe("sidebar menu lists", () => {
  for (const file of ["nav-main.tsx", "app-sidebar.tsx"]) {
    it(`${file} separates adjacent items`, () => {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8")
      const menus = source.match(/<SidebarMenu(\s[^>]*)?>/g) ?? []
      expect(menus.length).toBeGreaterThan(0)
      for (const menu of menus) expect(menu).toContain('className="gap-0.5"')
    })
  }
})
