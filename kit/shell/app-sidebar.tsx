"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import { Link, usePathname } from "../framework"
import { useCustomizer } from "../customizer/customizer-provider"
import { isActive } from "./nav-active"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import type { ShellConfig } from "./types"
import { WorkspaceSwitcher } from "./workspace-switcher"

export function AppSidebar({ config, badges }: { config: ShellConfig; badges: Record<string, number> }) {
  const variant = useCustomizer((state) => state.sidebarVariant)
  const collapsible = useCustomizer((state) => state.sidebarCollapsible)
  const direction = useCustomizer((state) => state.direction)
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar variant={variant} collapsible={collapsible} side={direction === "rtl" ? "right" : "left"}>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={config.workspaces} labels={config.workspaceLabels} />
      </SidebarHeader>
      <SidebarContent>
        {/* A real box, not display: contents (some screen readers drop those): the nav is the links' landmark. */}
        <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col">
          <NavMain groups={config.nav} badges={badges} />
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {config.secondary.map((link) => {
                  const Icon = link.icon
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton size="sm" tooltip={link.title} isActive={isActive(pathname, link.href)} render={<Link href={link.href} onClick={() => setOpenMobile(false)} />}>
                        {Icon && <Icon />}
                        <span>{link.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={config.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
