import type { Metadata } from "next"

import { ProfileSettingsPage } from "@/features/settings/profile-page"

export const metadata: Metadata = { title: "Profile" }

export default function Page() {
  return <ProfileSettingsPage />
}
