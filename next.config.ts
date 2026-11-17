import type { NextConfig } from "next"

/**
 * Three builds:
 * - `pnpm build`: a regular Next.js app. This is what you deploy.
 * - `STATIC_EXPORT=1 pnpm build`: a static site in `out/` (set BASE_PATH if it lives under a path).
 * - `pnpm build:demo` (DEMO_BUILD=1): the public demo at demo.shadcnstore.com/chronicle, a static
 *   export plus the demo-only pages (`*.demo.tsx`) and the bar that links back to ShadcnStore.
 *
 * `*.further.tsx` (the "Go further" page about the paid templates) is in the demo and in
 * `pnpm dev`, never in `pnpm build`, so the people who use your app never see it.
 */
const isDemoBuild = process.env.DEMO_BUILD === "1"
const isDev = process.env.NODE_ENV === "development"
const isStatic = isDemoBuild || process.env.STATIC_EXPORT === "1"
const basePath = isDemoBuild ? "/chronicle" : (process.env.BASE_PATH ?? "")

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-right" },
  // next build type-checks with tsconfig.build.json, which leaves the tests out:
  // vitest is a devDependency, and installs that skip those must still build.
  typescript: { tsconfigPath: "tsconfig.build.json" },
  // Keep `next dev` from writing its own AGENTS.md; docs/ already covers the project.
  agentRules: false,
  pageExtensions: ["tsx", "ts", ...(isDemoBuild ? ["demo.tsx"] : []), ...(isDemoBuild || isDev ? ["further.tsx"] : [])],
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
