import type { Metadata } from "next"

import { LandingPage } from "@/features/landing/landing-page"

export const metadata: Metadata = {
  title: "Tidewell: subscription analytics",
  description: "Frontier, the SaaS landing page that ships with Chronicle, shown selling Tidewell, a fictional subscription analytics product.",
}

export default function Page() {
  return <LandingPage />
}
