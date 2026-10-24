import type { Metadata } from "next"

import { GoFurtherPage } from "@/features/demo/go-further-page"

export const metadata: Metadata = { title: "Go further" }

/** Demo build only (`*.demo.tsx`, see next.config.ts). */
export default function Page() {
  return <GoFurtherPage />
}
