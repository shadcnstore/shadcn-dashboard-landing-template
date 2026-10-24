import {
  BarChart3Icon,
  BellIcon,
  CalendarDaysIcon,
  CheckSquareIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessagesSquareIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import type { NavGroup, NavLink } from "@/kit/shell/types"

/**
 * One list drives the sidebar, the top nav, ⌘K and the G shortcuts
 * (G then the letter jumps to the page). Add a page here and it appears
 * everywhere at once.
 */
export const NAV: NavGroup[] = [
  {
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboardIcon, shortcut: "o" },
      { title: "Analytics", href: "/analytics", icon: BarChart3Icon, shortcut: "a" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Users", href: "/users", icon: UsersIcon, shortcut: "u" },
      { title: "Tasks", href: "/tasks", icon: CheckSquareIcon, shortcut: "t", badge: "tasks" },
    ],
  },
  {
    label: "Apps",
    items: [
      { title: "Mail", href: "/mail", icon: MailIcon, shortcut: "m", badge: "mail" },
      { title: "Chat", href: "/chat", icon: MessagesSquareIcon, shortcut: "c" },
      { title: "Calendar", href: "/calendar", icon: CalendarDaysIcon, shortcut: "l" },
    ],
  },
]

export const SECONDARY_NAV: NavLink[] = [
  { title: "Notifications", href: "/notifications", icon: BellIcon, shortcut: "n" },
  { title: "Settings", href: "/settings", icon: SettingsIcon, shortcut: "s" },
  // The public demo only: what the paid templates add (features/demo). Your build never shows it.
  ...(process.env.NEXT_PUBLIC_DEMO === "1" ? [{ title: "Go further", href: "/go-further", icon: SparklesIcon }] : []),
]
