import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // shadcn/ui components stay exactly as the CLI installs them.
    files: ["components/ui/**", "hooks/use-mobile.ts"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    // Data and metrics are pure: they never import React or screens.
    files: ["data/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["react", "@/features/*", "@/components/*", "@/app/*"], message: "data/ is pure TypeScript." }] }],
    },
  },
  {
    // The Dashboard Kit is synced from shadcnstore/dashboard-kit and never edited here.
    files: ["kit/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { regex: "^@/(?!components/ui/[a-z-]+$|lib/utils$|lib/clock$)", message: "kit/ may import only kit/, packages, @/components/ui, @/lib/utils and @/lib/clock." },
            { regex: "^\\.\\./\\.\\.(/|$)", message: "kit/ may not import outside kit/ by a relative path either." },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])

export default eslintConfig
