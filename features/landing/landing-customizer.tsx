"use client"

import { PaletteIcon } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"

/**
 * The Kit customizer for the landing page, loaded after the page is
 * interactive so the first paint carries none of it. Until then the same
 * button holds its place.
 */
const CustomizerPanel = dynamic(() => import("@/kit/customizer/customizer-panel").then((module) => module.CustomizerPanel), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="icon" aria-label="Customize theme" disabled>
      <PaletteIcon />
    </Button>
  ),
})

export function LandingCustomizer() {
  return <CustomizerPanel />
}
