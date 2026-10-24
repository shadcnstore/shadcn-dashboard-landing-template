"use client"

import { MenuIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { useCommandMenu } from "../command/command-menu"
import { useCustomizer } from "../customizer/customizer-provider"
import { CustomizerPanel } from "../customizer/customizer-panel"
import { AppSidebar } from "./app-sidebar"
import { BreadcrumbLabelProvider, Breadcrumbs, titleFor } from "./breadcrumbs"
import { ModeToggle } from "./mode-toggle"
import { initials, UserMenuContent } from "./nav-user"
import { TopNav } from "./top-nav"
import type { ShellConfig } from "./types"

function SearchButton() {
  const { setOpen } = useCommandMenu()
  return (
    <Button
      variant="outline"
      className="w-9 justify-center px-0 text-muted-foreground sm:w-56 sm:justify-between sm:px-2.5"
      onClick={() => setOpen(true)}
      aria-keyshortcuts="Meta+K Control+K"
    >
      {/* The visible word is the name (no aria-label), so the name always matches what is on screen. */}
      <span className="flex items-center gap-2">
        <SearchIcon />
        <span className="sr-only sm:not-sr-only">Search…</span>
      </span>
      <KbdGroup aria-hidden className="hidden sm:inline-flex">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  )
}

export interface AppShellProps {
  config: ShellConfig
  badges: Record<string, number>
  /** Header buttons placed before the customizer (notifications, assistant). */
  actions?: React.ReactNode
  /** Panels rendered beside the content, e.g. an assistant side panel. */
  aside?: React.ReactNode
  /** Breadcrumb title of the home route ("/"). Default: the nav entry for "/", else "Overview". */
  home?: string
  children: React.ReactNode
}

/**
 * The frame every dashboard page sits in. Layout, sidebar style and content
 * width come from the customizer; navigation comes from `config`.
 */
export function AppShell({ config, badges, actions, aside, home: homeTitle, children }: AppShellProps) {
  const layout = useCustomizer((state) => state.layout)
  const contentWidth = useCustomizer((state) => state.contentWidth)
  const Brand = config.brand.logo
  const links = [...config.nav.flatMap((group) => group.items), ...config.secondary]
  const home = { title: homeTitle ?? titleFor("/", links) ?? "Overview", href: "/" }
  // The shell stays mounted across routes, so the mobile menu closes itself when a link is followed.
  const [menuOpen, setMenuOpen] = useState(false)

  // The sidebar layout's SidebarInset is already the page's <main>, so the content there is a <div>.
  const Content = layout === "top" ? "main" : "div"
  const main = (
    <Content className={cn("flex w-full min-w-0 flex-1 flex-col gap-6 bg-page p-4 md:p-6", contentWidth === "contained" && "mx-auto max-w-7xl")}>
      {children}
    </Content>
  )

  const toolbar = (
    <div className="ms-auto flex items-center gap-1">
      <SearchButton />
      {actions}
      <ModeToggle />
      <CustomizerPanel />
    </div>
  )

  if (layout === "top") {
    return (
      <BreadcrumbLabelProvider>
        <div className="flex min-h-svh flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" />}>
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>{config.brand.name}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-2">
                  {links.map((link) => (
                    <Button key={link.href} variant="ghost" className="justify-start" nativeButton={false} render={<Link href={link.href} onClick={() => setMenuOpen(false)} />}>
                      {link.icon && <link.icon data-icon="inline-start" />}
                      {link.title}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-medium">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Brand className="size-4" />
              </span>
              <span className="sr-only sm:not-sr-only">{config.brand.name}</span>
            </Link>
            <TopNav groups={config.nav} />
            {toolbar}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu" />}>
                <Avatar className="size-7">
                  {config.user.avatar && <AvatarImage src={config.user.avatar} alt={config.user.name} />}
                  <AvatarFallback>{initials(config.user.name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <UserMenuContent user={config.user} />
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <div className={cn("flex w-full min-w-0 flex-1 flex-col", contentWidth === "contained" && "mx-auto max-w-7xl")}>
            <div className="px-4 pt-4 md:px-6">
              <Breadcrumbs links={links} home={home} />
            </div>
            {main}
          </div>
          {aside}
        </div>
      </BreadcrumbLabelProvider>
    )
  }

  return (
    <BreadcrumbLabelProvider>
      <SidebarProvider>
        <AppSidebar config={config} badges={badges} />
        {/* min-w-0 lets wide tables scroll inside their card instead of widening the page. */}
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:rounded-t-xl">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-1 data-vertical:h-4 data-vertical:self-center" />
            <Breadcrumbs links={links} home={home} />
            {toolbar}
          </header>
          {main}
        </SidebarInset>
        {aside}
      </SidebarProvider>
    </BreadcrumbLabelProvider>
  )
}
