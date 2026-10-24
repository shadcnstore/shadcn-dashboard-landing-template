import type { Metadata } from "next"
import { Suspense } from "react"

import { AnalyticsPage } from "@/features/analytics/analytics-page"

export const metadata: Metadata = { title: "Analytics" }

export default function Page() {
  return (
    <Suspense>
      <AnalyticsPage />
    </Suspense>
  )
}
