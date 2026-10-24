import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"

/** A brand or workspace mark: any Lucide icon, or a template's own component (a lettered tile, an SVG). */
export type LogoComponent = ComponentType<{ className?: string }>

export interface NavLink {
  title: string
  href: string
  icon?: LucideIcon
  /** Key into the `badges` map passed to the shell, e.g. "orders". */
  badge?: string
  /** Second key of a `G` shortcut, e.g. "o" for `G O`. */
  shortcut?: string
  items?: NavLink[]
}

export interface NavGroup {
  label?: string
  items: NavLink[]
}

export interface Workspace {
  id: string
  name: string
  description: string
  logo: LogoComponent
}

export interface ShellUser {
  name: string
  email: string
  avatar?: string
}

export interface ShellConfig {
  brand: { name: string; logo: LogoComponent }
  nav: NavGroup[]
  /** Links pinned to the bottom of the sidebar (settings, help). */
  secondary: NavLink[]
  workspaces: Workspace[]
  /** Words in the workspace switcher. Default: "Workspaces" and "Add workspace". */
  workspaceLabels?: { group: string; add: string }
  user: ShellUser
}
