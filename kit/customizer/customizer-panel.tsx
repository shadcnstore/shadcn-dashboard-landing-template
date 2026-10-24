"use client"

import { PaletteIcon } from "lucide-react"
import { lazy, Suspense, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { whenIdle } from "../ui-patterns/when-idle"
import { useCustomizer } from "./customizer-provider"

// The controls (selects, fields, the import dialog) load when the panel first opens: no page needs them to paint.
const loadBody = () => import("./customizer-panel-body")
const CustomizerPanelBody = lazy(loadBody)
const ImportDialog = lazy(() => loadBody().then((module) => ({ default: module.ImportDialog })))

export function CustomizerPanel() {
  const open = useCustomizer((state) => state.panelOpen)
  const setOpen = useCustomizer((state) => state.setPanelOpen)
  // Outside the popover, so closing the popover never takes an open import (and its pasted CSS) with it.
  const [importing, setImporting] = useState(false)
  // Kept mounted after the first import, so the dialog can animate closed.
  const [importMounted, setImportMounted] = useState(false)
  if (importing && !importMounted) {
    setImportMounted(true)
  }
  useEffect(() => whenIdle(() => void loadBody()), [])
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger render={<PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="Customize theme" />} />}>
            <PaletteIcon />
          </TooltipTrigger>
          <TooltipContent>Customize</TooltipContent>
        </Tooltip>
        {/* Its own view-transition layer, kept live (see globals.css), so its controls animate while the page cross-fades. */}
        <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 [view-transition-name:customizer]">
          <Suspense fallback={<div className="h-[min(38rem,calc(var(--available-height)-1rem))]" />}>
            <CustomizerPanelBody onImport={() => setImporting(true)} />
          </Suspense>
        </PopoverContent>
      </Popover>
      {importMounted && (
        <Suspense fallback={null}>
          <ImportDialog open={importing} onOpenChange={setImporting} />
        </Suspense>
      )}
    </>
  )
}
