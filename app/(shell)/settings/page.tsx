import type { Metadata } from "next"

import { SettingsRedirect } from "@/features/settings/settings-redirect"

export const metadata: Metadata = { title: "Settings" }

export default function Page() {
  return <SettingsRedirect to="/settings/profile" />
}
