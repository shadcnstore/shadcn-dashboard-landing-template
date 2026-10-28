"use client"

import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Link, usePathname } from "../framework"
import { activeHref, isActive } from "./nav-active"
import type { NavGroup, NavLink } from "./types"

function Badge({ value, beforeAction }: { value: number | undefined; beforeAction?: boolean }) {
  if (!value) {
    return null
  }
  // Links with sub-pages have an expand button in the badge's usual spot.
  return <SidebarMenuBadge className={beforeAction ? "end-8" : undefined}>{value > 99 ? "99+" : value}</SidebarMenuBadge>
}

function Entry({ link, current, badges }: { link: NavLink; current: string | null; badges: Record<string, number> }) {
  const pathname = usePathname()
  const { setOpenMobile, state, isMobile } = useSidebar()
  const Icon = link.icon
  // A section is open on its own page and on any of its sub-pages, wherever they live.
  const inSection = isActive(pathname, link.href) || (link.items ?? []).some((item) => isActive(pathname, item.href))
  const close = () => setOpenMobile(false)
  // Controlled, so moving between sections can open and close it after the
  // first render (Base UI warns if `defaultOpen` changes). Like Shopify's
  // admin, only the section you are in shows its sub-pages; the chevron still
  // lets you peek into another.
  const [open, setOpen] = useState(inSection)
  const [wasInSection, setWasInSection] = useState(inSection)
  if (inSection !== wasInSection) {
    setWasInSection(inSection)
    setOpen(inSection)
  }

  if (!link.items || link.items.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={current === link.href}
          tooltip={link.title}
          render={<Link href={link.href} onClick={close} />}
        >
          {Icon && <Icon />}
          <span>{link.title}</span>
        </SidebarMenuButton>
        {link.badge && <Badge value={badges[link.badge]} />}
      </SidebarMenuItem>
    )
  }

  const subPages = (
    <CollapsibleContent>
      <SidebarMenuSub>
        {link.items.map((item) => (
          <SidebarMenuSubItem key={item.href}>
            <SidebarMenuSubButton isActive={current === item.href} render={<Link href={item.href} onClick={close} />}>
              <span>{item.title}</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
    </CollapsibleContent>
  )

  // The icon-only sidebar hides sub-pages, so there the row stays a link to `href`.
  if (link.expandOnly && (isMobile || state === "expanded")) {
    return (
      <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
        <SidebarMenuButton
          tooltip={link.title}
          render={<CollapsibleTrigger />}
        >
          {Icon && <Icon />}
          <span>{link.title}</span>
          <ChevronRightIcon data-chevron="" className="ms-auto transition-[rotate] duration-250 ease-smooth-out group-aria-expanded/menu-button:rotate-90 rtl:rotate-180 rtl:group-aria-expanded/menu-button:rotate-90" />
        </SidebarMenuButton>
        {link.badge && <Badge value={badges[link.badge]} beforeAction />}
        {subPages}
      </Collapsible>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
      <SidebarMenuButton
        isActive={current === link.href}
        tooltip={link.title}
        render={
          <Link
            href={link.href}
            onClick={() => {
              // Going to the section also opens its sub-pages.
              setOpen(true)
              close()
            }}
          />
        }
      >
        {Icon && <Icon />}
        <span>{link.title}</span>
      </SidebarMenuButton>
      {link.badge && <Badge value={badges[link.badge]} beforeAction />}
      <CollapsibleTrigger
        render={<SidebarMenuAction className="transition-transform duration-250 ease-smooth-out data-panel-open:rotate-90" aria-label={`Show ${link.title} pages`} />}
      >
        <ChevronRightIcon className="rtl:rotate-180" />
      </CollapsibleTrigger>
      {subPages}
    </Collapsible>
  )
}

export function NavMain({ groups, badges }: { groups: NavGroup[]; badges: Record<string, number> }) {
  const pathname = usePathname()
  const current = activeHref(
    pathname,
    groups.flatMap((group) => group.items)
  )
  return (
    <>
      {groups.map((group, index) => (
        <SidebarGroup key={group.label ?? index}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu className="gap-0.5">
            {group.items.map((link) => (
              <Entry key={link.href} link={link} current={current} badges={badges} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
