"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { Link, usePathname } from "../framework"
import { activeHref } from "./nav-active"
import type { NavGroup } from "./types"

/** The horizontal alternative to the sidebar, driven by the same nav config. */
export function TopNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()
  const links = groups.flatMap((group) => group.items)
  const current = activeHref(pathname, links)

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {links.map((link) => {
          const inSection = link.items?.some((item) => item.href === current) || current === link.href
          if (!link.items || link.items.length === 0) {
            return (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  active={current === link.href}
                  className={navigationMenuTriggerStyle()}
                  render={<Link href={link.href} />}
                >
                  {link.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          return (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuTrigger data-active={inSection || undefined}>
                {link.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-56 gap-1 p-1">
                  {[{ ...link, title: `All ${link.title.toLowerCase()}` }, ...link.items]
                    .filter((item, index, list) => list.findIndex((other) => other.href === item.href) === index)
                    .map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink active={current === item.href} render={<Link href={item.href} />}>
                          {item.title}
                        </NavigationMenuLink>
                      </li>
                    ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
