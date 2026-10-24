import type { Metadata } from "next"

import { AppearanceSettingsPage } from "@/features/settings/appearance-page"

export const metadata: Metadata = { title: "Appearance" }

export default function Page() {
  return <AppearanceSettingsPage />
}
