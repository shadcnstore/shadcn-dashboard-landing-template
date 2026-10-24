"use client"

import { SETTINGS_NAV } from "@/config/settings-nav"
import { SettingsLayout } from "@/kit/settings/settings-layout"

/** The settings frame with Chronicle's sections. A client component, because the section icons are components. */
export function SettingsFrame({ children }: { children: React.ReactNode }) {
  return (
    <SettingsLayout
      groups={SETTINGS_NAV}
      description="Your profile, how Chronicle looks and which alerts reach you."
    >
      {children}
    </SettingsLayout>
  )
}
