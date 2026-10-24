import { ChronicleMark } from "@/components/chronicle/logo"
import type { ShellConfig } from "@/kit/shell/types"
import { avatarFor } from "@/lib/avatars"

import { NAV, SECONDARY_NAV } from "./nav"

/** The sample business: Tidewell, a subscription-analytics company. Replace with your own. */
export const SITE: ShellConfig = {
  brand: { name: "Chronicle", logo: ChronicleMark },
  nav: NAV,
  secondary: SECONDARY_NAV,
  workspaces: [
    { id: "tidewell", name: "Tidewell", description: "Production", logo: ChronicleMark },
    { id: "tidewell-staging", name: "Tidewell Staging", description: "Sandbox", logo: ChronicleMark },
  ],
  workspaceLabels: { group: "Workspaces", add: "Add workspace" },
  user: { name: "Maya Okafor", email: "maya.okafor@example.com", avatar: avatarFor("Maya Okafor") ?? undefined },
}
