import type { Metadata } from "next"

import { GoFurtherPage } from "@/features/demo/go-further-page"

export const metadata: Metadata = { title: "Go further" }

/** The demo build and `pnpm dev` only (`*.further.tsx`, see next.config.ts). */
export default function Page() {
  return <GoFurtherPage />
}
