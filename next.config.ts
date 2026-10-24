import type { NextConfig } from "next"

/**
 * `pnpm build:demo` (DEMO_BUILD=1) produces the static demo for
 * demo.shadcnstore.com/chronicle, with the demo-only pages (`*.demo.tsx`) and
 * the bar that links back to ShadcnStore. A plain `pnpm build` is what you
 * deploy: a regular Next.js app with none of that.
 */
const isDemoBuild = process.env.DEMO_BUILD === "1"
const demoBasePath = "/chronicle"

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-right" },
  // Keep `next dev` from writing its own AGENTS.md; docs/ already covers the project.
  agentRules: false,
  pageExtensions: isDemoBuild ? ["tsx", "ts", "demo.tsx"] : ["tsx", "ts"],
  ...(isDemoBuild
    ? {
        output: "export",
        basePath: demoBasePath,
        trailingSlash: false,
        env: { NEXT_PUBLIC_BASE_PATH: demoBasePath, NEXT_PUBLIC_DEMO: "1" },
        images: { unoptimized: true },
      }
    : {}),
}

export default nextConfig
