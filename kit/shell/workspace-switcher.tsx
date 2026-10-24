"use client"

import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

import type { Workspace } from "./types"

export function WorkspaceSwitcher({ workspaces, labels = { group: "Workspaces", add: "Add workspace" } }: { workspaces: Workspace[]; labels?: { group: string; add: string } }) {
  const { isMobile } = useSidebar()
  const [active, setActive] = useState(workspaces[0])
  const Logo = active.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground" />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Logo className="size-4" />
            </div>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">{active.name}</span>
              <span className="truncate text-xs text-muted-foreground">{active.description}</span>
            </div>
            <ChevronsUpDownIcon className="ms-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" align="start" side={isMobile ? "bottom" : "right"} sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{labels.group}</DropdownMenuLabel>
              {workspaces.map((workspace) => {
                const Icon = workspace.logo
                return (
                  <DropdownMenuItem key={workspace.id} onClick={() => setActive(workspace)} className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Icon className="size-4" />
                    </div>
                    {workspace.name}
                    {workspace.id === active.id && <DropdownMenuShortcut>Current</DropdownMenuShortcut>}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <PlusIcon />
                </div>
                <span className="text-muted-foreground">{labels.add}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
