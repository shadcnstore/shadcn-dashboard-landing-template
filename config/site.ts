import { BRAND } from "@/config/brand"
import type { ShellConfig } from "@/kit/shell/types"
import { avatarFor } from "@/lib/avatars"

import { NAV, SECONDARY_NAV } from "./nav"

/** The shell around every dashboard page. The name and mark come from config/brand.ts. */
export const SITE: ShellConfig = {
  brand: { name: BRAND.name, logo: BRAND.mark },
  nav: NAV,
  secondary: SECONDARY_NAV,
  workspaces: [
    { id: "production", name: BRAND.name, description: "Production", logo: BRAND.mark },
    { id: "staging", name: `${BRAND.name} Staging`, description: "Sandbox", logo: BRAND.mark },
  ],
  workspaceLabels: { group: "Workspaces", add: "Add workspace" },
  user: { name: "Maya Okafor", email: "maya.okafor@example.com", avatar: avatarFor("Maya Okafor") ?? undefined },
}
