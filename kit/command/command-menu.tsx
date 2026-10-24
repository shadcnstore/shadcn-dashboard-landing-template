"use client"

import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState } from "react"


import type { NavLink } from "../shell/types"
import { pressedKey } from "../shortcuts/key"
import { whenIdle } from "../ui-patterns/when-idle"

// The palette (cmdk, the dialog) loads on first open: no page needs it for its first paint.
const loadPalette = () => import("./command-palette")
const CommandPalette = lazy(loadPalette)

export interface CommandAction {
  id: string
  title: string
  icon?: LucideIcon
  shortcut?: string
  group?: string
  run: () => void
}

export interface CommandSearchResult {
  id: string
  title: string
  subtitle?: string
  href: string
  group: string
  icon?: LucideIcon
}

interface CommandContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const CommandContext = createContext<CommandContextValue | null>(null)

export function useCommandMenu(): CommandContextValue {
  const context = useContext(CommandContext)
  if (!context) {
    throw new Error("useCommandMenu must be used inside CommandMenuProvider.")
  }
  return context
}

function flatten(links: NavLink[], parent?: string): { title: string; href: string; icon?: LucideIcon; shortcut?: string }[] {
  const all = links.flatMap((link) => [
    { title: parent ? `${parent} › ${link.title}` : link.title, href: link.href, icon: link.icon, shortcut: link.shortcut },
    ...(link.items ? flatten(link.items, link.title) : []),
  ])
  // A parent ("Projects") and its first child ("All projects") often share a page; list it once.
  return all.filter((page, index) => all.findIndex((other) => other.href === page.href) === index)
}

/**
 * ⌘K palette: jump to any page, run an action, or search records. `search` is
 * called as the user types (debounced) and its results are listed first.
 */
export function CommandMenuProvider({
  links,
  actions,
  search,
  description = "Search records, jump to a page, or run an action.",
  children,
}: {
  links: NavLink[]
  actions: CommandAction[]
  search?: (text: string) => Promise<CommandSearchResult[]>
  /** Read by screen readers when the palette opens: what can be searched. */
  description?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Latched on first open (a render-time update, the React way to derive state), so the palette is fetched only when asked for.
  const [mounted, setMounted] = useState(false)
  if (open && !mounted) {
    setMounted(true)
  }
  const [text, setText] = useState("")
  const [results, setResults] = useState<CommandSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const pages = useMemo(() => flatten(links), [links])

  // Fetched after first paint, so the first ⌘K opens at once and keys typed straight after it reach the input.
  // Mounted (closed) as soon as it has loaded, like the always-mounted dialog before 1.0.7.
  useEffect(() => whenIdle(() => void loadPalette().then(() => setMounted(true))), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (pressedKey(event) === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!search || text.trim().length < 2) {
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      setSearching(true)
      search(text)
        .then((found) => !cancelled && setResults(found))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setSearching(false))
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [search, text])

  const visibleResults = text.trim().length < 2 ? [] : results

  const go = (href: string) => {
    setOpen(false)
    setText("")
    router.push(href)
  }

  const groups = visibleResults.reduce<Record<string, CommandSearchResult[]>>((acc, result) => {
    ;(acc[result.group] ??= []).push(result)
    return acc
  }, {})

  const actionGroups = actions.reduce<Record<string, CommandAction[]>>((acc, action) => {
    ;(acc[action.group ?? "Actions"] ??= []).push(action)
    return acc
  }, {})

  return (
    <CommandContext.Provider value={{ open, setOpen }}>
      {children}
      {mounted && (
        <Suspense fallback={null}>
          <CommandPalette
            open={open}
            onOpenChange={(value) => {
              setOpen(value)
              if (!value) {
                setText("")
              }
            }}
            description={description}
            text={text}
            onTextChange={setText}
            searching={searching}
            groups={groups}
            actionGroups={actionGroups}
            pages={pages}
            go={go}
            runAction={(action) => {
              setOpen(false)
              setText("")
              action.run()
            }}
          />
        </Suspense>
      )}
    </CommandContext.Provider>
  )
}
