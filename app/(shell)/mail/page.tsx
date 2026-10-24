import type { Metadata } from "next"

import { MailApp } from "@/features/mail/mail-app"

export const metadata: Metadata = { title: "Mail" }

export default function Page() {
  return <MailApp />
}
