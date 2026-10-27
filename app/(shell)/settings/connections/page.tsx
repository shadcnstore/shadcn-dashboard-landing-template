import type { Metadata } from "next"

import { ConnectionsSettingsPage } from "@/features/settings/connections-page"

export const metadata: Metadata = { title: "Connections" }

export default function Page() {
  return <ConnectionsSettingsPage />
}
