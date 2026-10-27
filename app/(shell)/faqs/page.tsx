import type { Metadata } from "next"

import { FaqsPage } from "@/features/faqs/faqs-page"

export const metadata: Metadata = { title: "FAQs" }

export default function Page() {
  return <FaqsPage />
}
