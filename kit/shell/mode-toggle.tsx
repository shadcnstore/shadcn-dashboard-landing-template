"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { crossFade } from "../customizer/cross-fade"

/**
 * Light or dark in one click, for the header. The customizer keeps the
 * three-way choice (with System); this is the quick switch.
 *
 * The icon follows the `.dark` class rather than `resolvedTheme`, so it is
 * right on the first paint: the theme is unknown on the server, and reading it
 * would swap the icon visibly after hydration.
 */
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const layer = "col-start-1 row-start-1 transition-[opacity,scale,rotate] duration-250 ease-smooth-out"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => crossFade(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
          />
        }
      >
        <span className="grid place-items-center *:size-[inherit]" aria-hidden>
          <SunIcon className={cn(layer, "scale-100 rotate-0 opacity-100 dark:scale-50 dark:-rotate-90 dark:opacity-0")} />
          <MoonIcon className={cn(layer, "scale-50 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100")} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
        <Kbd>D</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
