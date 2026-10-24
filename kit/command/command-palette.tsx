"use client"

import type { LucideIcon } from "lucide-react"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

import type { CommandAction, CommandSearchResult } from "./command-menu"

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description: string
  text: string
  onTextChange: (text: string) => void
  searching: boolean
  groups: Record<string, CommandSearchResult[]>
  actionGroups: Record<string, CommandAction[]>
  pages: { title: string; href: string; icon?: LucideIcon; shortcut?: string }[]
  go: (href: string) => void
  runAction: (action: CommandAction) => void
}

/** The ⌘K dialog. Loaded lazily by `CommandMenuProvider` on first open. */
export default function CommandPalette({ open, onOpenChange, description, text, onTextChange, searching, groups, actionGroups, pages, go, runAction }: CommandPaletteProps) {
  // Not ui/CommandDialog: it renders its sr-only title outside the popup, so the title is always in the page
  // (axe "region" on every route) and never labels the dialog. Here the header sits inside the popup.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Search and actions</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command>
        <CommandInput placeholder="Search or type a command…" value={text} onValueChange={onTextChange} />
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
                    onSelect={() => runAction(action)}
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
  )
}
