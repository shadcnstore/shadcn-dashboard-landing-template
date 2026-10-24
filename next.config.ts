import type { NextConfig } from "next"

/**
 * Three builds:
 * - `pnpm build`: a regular Next.js app. This is what you deploy.
 * - `STATIC_EXPORT=1 pnpm build`: a static site in `out/` (set BASE_PATH if it lives under a path).
 * - `pnpm build:demo` (DEMO_BUILD=1): the public demo at demo.shadcnstore.com/chronicle, a static
 *   export plus the demo-only pages (`*.demo.tsx`) and the bar that links back to ShadcnStore.
 */
const isDemoBuild = process.env.DEMO_BUILD === "1"
const isStatic = isDemoBuild || process.env.STATIC_EXPORT === "1"
const basePath = isDemoBuild ? "/chronicle" : (process.env.BASE_PATH ?? "")

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-right" },
  // Keep `next dev` from writing its own AGENTS.md; docs/ already covers the project.
  agentRules: false,
  pageExtensions: isDemoBuild ? ["tsx", "ts", "demo.tsx"] : ["tsx", "ts"],
  ...(isStatic
    ? {
        output: "export",
        ...(basePath ? { basePath } : {}),
        env: { NEXT_PUBLIC_BASE_PATH: basePath, ...(isDemoBuild ? { NEXT_PUBLIC_DEMO: "1" } : {}) },
        images: { unoptimized: true },
      }
    : {}),
}

export default nextConfig
