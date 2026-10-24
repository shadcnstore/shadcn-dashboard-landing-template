"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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
} from "@/components/ui/sidebar"

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

  return (
    <Sidebar variant={variant} collapsible={collapsible} side={direction === "rtl" ? "right" : "left"}>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={config.workspaces} labels={config.workspaceLabels} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={config.nav} badges={badges} />
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {config.secondary.map((link) => {
                const Icon = link.icon
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton size="sm" tooltip={link.title} isActive={isActive(pathname, link.href)} render={<Link href={link.href} />}>
                      {Icon && <Icon />}
                      <span>{link.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={config.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
