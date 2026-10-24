"use client"

import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

import type { NavLink } from "../shell/types"
import { pressedKey } from "../shortcuts/key"

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
  const [text, setText] = useState("")
  const [results, setResults] = useState<CommandSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const pages = useMemo(() => flatten(links), [links])

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
      {/* Not ui/CommandDialog: it renders its sr-only title outside the popup, so the title is always in the page
          (axe "region" on every route) and never labels the dialog. Here the header sits inside the popup. */}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) {
            setText("")
          }
        }}
      >
        <DialogContent className="top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Search and actions</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Command>
          <CommandInput placeholder="Search or type a command…" value={text} onValueChange={setText} />
          <CommandList>
            <CommandEmpty>{searching ? <Spinner className="mx-auto" /> : "Nothing found."}</CommandEmpty>
            {Object.entries(groups).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((result) => {
                  const Icon = result.icon
                  return (
                    <CommandItem key={result.id} value={`${result.title} ${result.subtitle ?? ""} ${text}`} onSelect={() => go(result.href)}>
                      {Icon && <Icon />}
                      <span>{result.title}</span>
                      {result.subtitle && <span className="truncate text-muted-foreground">{result.subtitle}</span>}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
            {Object.keys(groups).length > 0 && <CommandSeparator />}
            {Object.entries(actionGroups).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((action) => {
                  const Icon = action.icon
                  return (
                    <CommandItem
                      key={action.id}
                      value={action.title}
                      onSelect={() => {
                        setOpen(false)
                        setText("")
                        action.run()
                      }}
                    >
                      {Icon && <Icon />}
                      <span>{action.title}</span>
                      {action.shortcut && <CommandShortcut>{action.shortcut}</CommandShortcut>}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup heading="Go to">
              {pages.map((page) => {
                const Icon = page.icon
                return (
                  <CommandItem key={page.href} value={`go ${page.title}`} onSelect={() => go(page.href)}>
                    {Icon && <Icon />}
                    <span>{page.title}</span>
                    {page.shortcut && <CommandShortcut>G {page.shortcut.toUpperCase()}</CommandShortcut>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </CommandContext.Provider>
  )
}
