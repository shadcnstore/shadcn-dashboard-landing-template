import {
  BarChart3Icon,
  BellIcon,
  CalendarDaysIcon,
  CheckSquareIcon,
  CircleHelpIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  MailIcon,
  MessagesSquareIcon,
  SettingsIcon,
  SparklesIcon,
  TagIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react"

import { ShadcnStoreMark } from "@/components/chronicle/shadcnstore-mark"
import { BRAND } from "@/config/brand"
import { authPath, type AuthScreen, type AuthVariant } from "@/features/auth/auth-paths"
import type { NavGroup, NavLink } from "@/kit/shell/types"
import type { LucideIcon } from "lucide-react"

const AUTH_SCREENS: [AuthScreen, string][] = [
  ["sign-in", "Sign in"],
  ["sign-up", "Sign up"],
  ["forgot-password", "Forgot password"],
]
const AUTH_LAYOUTS: AuthVariant[] = [1, 2, 3]

/** Every auth screen in each of its three layouts (features/auth/auth-variant.tsx). */
const AUTH_PAGES: NavLink[] = AUTH_SCREENS.flatMap(([screen, title]) =>
  AUTH_LAYOUTS.map((variant) => ({ title: `${title} ${variant}`, href: authPath(screen, variant) }))
)

const ERROR_PAGES: NavLink[] = [
  { title: "Unauthorized", href: "/errors/unauthorized" },
  { title: "Forbidden", href: "/errors/forbidden" },
  { title: "Not found", href: "/errors/not-found" },
  { title: "Server error", href: "/errors/internal-server-error" },
  { title: "Maintenance", href: "/errors/under-maintenance" },
]

/**
 * One list drives the sidebar, the top nav, ⌘K and the G shortcuts
 * (G then the letter jumps to the page). Add a page here and it appears
 * everywhere at once. A link with `items` folds in the sidebar and opens
 * by itself on any page inside it.
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
  {
    label: "Pages",
    items: [
      { title: "Pricing", href: "/pricing", icon: TagIcon, shortcut: "p" },
      { title: "FAQs", href: "/faqs", icon: CircleHelpIcon, shortcut: "f" },
      { title: "Landing", href: "/landing", icon: GlobeIcon },
      { title: "Auth pages", href: "/sign-in", icon: LockKeyholeIcon, items: AUTH_PAGES, expandOnly: true },
      { title: "Errors", href: "/errors/not-found", icon: TriangleAlertIcon, items: ERROR_PAGES, expandOnly: true },
    ],
  },
]

export const SECONDARY_NAV: NavLink[] = [
  { title: "Notifications", href: "/notifications", icon: BellIcon, shortcut: "n" },
  { title: "Settings", href: "/settings", icon: SettingsIcon, shortcut: "s" },
  // The public demo only: what the paid templates add (features/demo). Your build never shows it.
  ...(process.env.NEXT_PUBLIC_DEMO === "1" ? [{ title: "Go further", href: "/go-further", icon: SparklesIcon }] : []),
  // The template credit (config/brand.ts, credits.show). A plain link, so it never gets a G shortcut.
  ...(BRAND.credits.show ? [{ title: `Built with ${BRAND.credits.by}`, href: BRAND.credits.href, icon: ShadcnStoreMark as unknown as LucideIcon }] : []),
]
