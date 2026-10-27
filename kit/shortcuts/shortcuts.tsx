"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { useRouter } from "../framework"
import type { NavLink } from "../shell/types"
import { pressedKey } from "./key"

export interface Shortcut {
  keys: string[]
  label: string
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

function collect(links: NavLink[]): { key: string; href: string; title: string }[] {
  return links.flatMap((link) => [
    ...(link.shortcut ? [{ key: link.shortcut.toLowerCase(), href: link.href, title: link.title }] : []),
    ...(link.items ? collect(link.items) : []),
  ])
}

const ShortcutsContext = createContext<{ openHelp: () => void } | null>(null)

export function useShortcutsHelp() {
  return useContext(ShortcutsContext)
}

/**
 * Keyboard navigation: `G` then a letter goes to a section (from each nav
 * link's `shortcut`), `?` lists every shortcut. Listens in the capture phase
 * so the second key of a sequence never reaches other handlers (the theme's
 * `D` toggle, for example).
 */
export function ShortcutsProvider({
  links,
  extra,
  children,
}: {
  links: NavLink[]
  extra: Shortcut[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const [help, setHelp] = useState(false)
  const pending = useRef<number | null>(null)
  const targets = useMemo(() => collect(links), [links])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) {
        return
      }
      const key = pressedKey(event)
      if (pending.current !== null) {
        window.clearTimeout(pending.current)
        pending.current = null
        const target = targets.find((candidate) => candidate.key === key)
        if (target) {
          event.preventDefault()
          event.stopPropagation()
          router.push(target.href)
        }
        return
      }
      if (key === "g") {
        pending.current = window.setTimeout(() => (pending.current = null), 1200)
        return
      }
      if (event.key === "?") {
        event.preventDefault()
        setHelp(true)
      }
    }
    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [router, targets])

  const all: Shortcut[] = [
    ...extra,
    ...targets.map((target) => ({ keys: ["G", target.key.toUpperCase()], label: `Go to ${target.title}` })),
    { keys: ["?"], label: "Show keyboard shortcuts" },
  ]

  return (
    <ShortcutsContext.Provider value={{ openHelp: () => setHelp(true) }}>
      {children}
      <Sheet open={help} onOpenChange={setHelp}>
        <SheetContent className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Keyboard shortcuts</SheetTitle>
            <SheetDescription>Press these anywhere outside a text field.</SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col gap-3 px-4 pb-4">
            {all.map((shortcut) => (
              <li key={`${shortcut.keys.join("+")}-${shortcut.label}`} className="flex items-center justify-between gap-4 text-sm">
                <span>{shortcut.label}</span>
                <KbdGroup>
                  {shortcut.keys.map((key, index) => (
                    <Kbd key={`${key}-${index}`}>{key}</Kbd>
                  ))}
                </KbdGroup>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </ShortcutsContext.Provider>
  )
}
