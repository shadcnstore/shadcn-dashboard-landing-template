import { BellIcon, PaletteIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

import type { SettingsGroup } from "@/kit/settings/settings-layout"

/** The settings sections, in menu order. Each one is its own page under /settings. */
export const SETTINGS_NAV: SettingsGroup[] = [
  {
    label: "You",
    items: [
      { title: "Profile", href: "/settings/profile", icon: UserIcon },
      {
        title: "Account and security",
        href: "/settings/account",
        icon: ShieldCheckIcon,
      },
    ],
  },
  {
    label: "Preferences",
    items: [
      { title: "Appearance", href: "/settings/appearance", icon: PaletteIcon },
      {
        title: "Notifications",
        href: "/settings/notifications",
        icon: BellIcon,
      },
    ],
  },
]
