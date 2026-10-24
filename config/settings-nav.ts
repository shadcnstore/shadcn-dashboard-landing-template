import { BellIcon, CreditCardIcon, KeyRoundIcon, PaletteIcon, ShieldCheckIcon, UserIcon, UsersIcon } from "lucide-react"

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
  // The public demo only: previews of screens the paid templates ship (features/demo). Your build never lists them.
  ...(process.env.NEXT_PUBLIC_DEMO === "1"
    ? [
        {
          label: "In the paid templates",
          items: [
            { title: "Team and roles", href: "/settings/team", icon: UsersIcon },
            { title: "Billing and plans", href: "/settings/billing", icon: CreditCardIcon },
            { title: "API keys", href: "/settings/api-keys", icon: KeyRoundIcon },
          ],
        },
      ]
    : []),
]
