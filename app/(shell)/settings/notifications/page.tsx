import type { Metadata } from "next"

import { NotificationSettingsPage } from "@/features/settings/notifications-page"

export const metadata: Metadata = { title: "Notifications" }

export default function Page() {
  return <NotificationSettingsPage />
}
