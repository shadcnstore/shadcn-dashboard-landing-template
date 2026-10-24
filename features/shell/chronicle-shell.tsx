"use client"

import { KeyboardIcon, MoonIcon, UserPlusIcon, UsersIcon, type LucideIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"

import { NAV, SECONDARY_NAV } from "@/config/nav"
import { SITE } from "@/config/site"
import type { User } from "@/data/schema"
import { useDemoCommands } from "@/features/demo/demo-commands"
import { useNotifications } from "@/features/notifications/store"
import { CommandMenuProvider, type CommandAction, type CommandSearchResult } from "@/kit/command/command-menu"
import { NotificationBell } from "@/kit/notifications/notification-bell"
import { AppShell } from "@/kit/shell/app-shell"
import { ShortcutsProvider, useShortcutsHelp } from "@/kit/shortcuts/shortcuts"
import { adapter } from "@/lib/data"
import { workspace } from "@/data/generate"

/**
 * Chronicle's frame: the Dashboard Kit shell (sidebar or top nav, customizer,
 * ⌘K, G shortcuts, notifications) wired to the sample workspace. Everything
 * it shows comes from config/nav.ts, config/site.ts and lib/data.ts.
 */

const LINKS = [...NAV.flatMap((group) => group.items), ...SECONDARY_NAV]
const TODO_TASKS = workspace().tasks.filter((task) => task.status === "todo" || task.status === "in_progress").length

function Frame({ children }: { children: React.ReactNode }) {
  const items = useNotifications((state) => state.items)
  const markRead = useNotifications((state) => state.markRead)
  return (
    <AppShell
      config={SITE}
      badges={{ tasks: TODO_TASKS, mail: 4 }}
      actions={<NotificationBell items={items} onMarkRead={markRead} viewAllHref="/notifications" settingsHref="/settings/notifications" emptyDescription="Payments, cancellations and upgrades appear here." />}
    >
      {children}
    </AppShell>
  )
}

const USER_ICON: LucideIcon = UsersIcon

function Commands({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const help = useShortcutsHelp()
  const router = useRouter()
  const demo = useDemoCommands()

  const actions = useMemo<CommandAction[]>(
    () => [
      { id: "invite", title: "Invite a user", icon: UserPlusIcon, group: "Actions", run: () => router.push("/users?invite=1") },
      { id: "over-limit", title: "Show users over their seat limit", icon: UsersIcon, group: "Actions", run: () => router.push("/users?view=over-limit") },
      {
        id: "theme",
        title: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        icon: MoonIcon,
        shortcut: "D",
        group: "Preferences",
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      { id: "shortcuts", title: "Keyboard shortcuts", icon: KeyboardIcon, shortcut: "?", group: "Preferences", run: () => help?.openHelp() },
      ...demo,
    ],
    [demo, help, resolvedTheme, router, setTheme]
  )

  const search = useCallback(async (text: string): Promise<CommandSearchResult[]> => {
    const result = await adapter.list("users", { search: text, pageSize: 8 })
    return result.rows.map((user: User) => ({ id: user.id, title: user.name, subtitle: `${user.email} · ${user.accountName}`, href: `/users/${user.id}`, group: "Users", icon: USER_ICON }))
  }, [])

  return (
    <CommandMenuProvider links={LINKS} actions={actions} search={search} description="Search users by name, email or account, jump to a page, or run an action.">
      {children}
    </CommandMenuProvider>
  )
}

export function ChronicleShell({ children }: { children: React.ReactNode }) {
  return (
    <ShortcutsProvider
      links={LINKS}
      extra={[
        { keys: ["⌘", "K"], label: "Search and actions" },
        { keys: ["⌘", "B"], label: "Collapse or expand the sidebar" },
        { keys: ["D"], label: "Toggle dark mode" },
        { keys: ["?"], label: "Show these shortcuts" },
      ]}
    >
      <Commands>
        <Frame>{children}</Frame>
      </Commands>
    </ShortcutsProvider>
  )
}
