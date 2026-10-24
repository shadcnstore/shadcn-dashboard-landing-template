"use client"

import {
  BanIcon,
  FileInputIcon,
  MonitorIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PopoverDescription, PopoverHeader, PopoverTitle } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { Segmented } from "../ui-patterns/segmented"
import { SwapIcon, useCopied } from "../ui-patterns/swap-icon"
import { crossFade } from "./cross-fade"
import { useCustomizer, useKitTheme } from "./customizer-provider"
import { findPreset, parseThemeCss, themeCss } from "./presets"
import type { CustomizerSettings } from "./settings"

const RADIUS_OPTIONS = [
  { value: "0rem", label: "", icon: BanIcon, ariaLabel: "No radius" },
  { value: "0.375rem", label: "SM" },
  { value: "0.625rem", label: "MD" },
  { value: "0.875rem", label: "LG" },
]

/** A preset's own radius, snapped to the nearest option the panel offers. */
function nearestRadius(radius: string): string {
  const rem = radius.endsWith("px") ? parseFloat(radius) / 16 : parseFloat(radius)
  return RADIUS_OPTIONS.reduce((best, option) =>
    Math.abs(parseFloat(option.value) - rem) < Math.abs(parseFloat(best.value) - rem) ? option : best
  ).value
}

/** A theme's primary, secondary, accent and muted side by side. */
function Swatches({ colors }: { colors: readonly string[] }) {
  return (
    <span className="flex h-6 w-20 shrink-0 divide-x divide-white/60 overflow-hidden rounded-sm ring-1 ring-black/15 ring-inset dark:ring-white/20" aria-hidden>
      {colors.map((color, index) => (
        // The preset's own colours: data, not styling.
        <span key={index} className="h-full flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const set = useCustomizer((state) => state.set)
  const [css, setCss] = useState("")
  const [error, setError] = useState<string | null>(null)

  const apply = () => {
    const parsed = parseThemeCss(css)
    if (!parsed) {
      setError("No `:root { --token: value; }` or `.dark { … }` block found in the pasted CSS.")
      return
    }
    const radius = parsed.light.radius
    delete parsed.light.radius
    set({ custom: parsed, ...(radius ? { radius } : {}) })
    setCss("")
    setError(null)
    onOpenChange(false)
    toast.add({ title: "Theme imported", description: "Every screen now uses the pasted tokens.", type: "success" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import a theme</DialogTitle>
          <DialogDescription>Paste the CSS that shadcn/create or tweakcn gives you. Both light and dark blocks are used.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="theme-css" className="sr-only">
              Theme CSS
            </FieldLabel>
            <Textarea
              id="theme-css"
              rows={10}
              className="font-mono text-xs"
              placeholder={":root {\n  --primary: oklch(0.55 0.2 260);\n  --radius: 0.5rem;\n}\n\n.dark {\n  --primary: oklch(0.7 0.16 260);\n}"}
              value={css}
              aria-invalid={error ? true : undefined}
              onChange={(event) => setCss(event.target.value)}
            />
            {error ? <FieldError>{error}</FieldError> : <FieldDescription>Only CSS variables are read. Nothing is sent anywhere.</FieldDescription>}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!css.trim()} onClick={apply}>
            Apply theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** The panel's controls, loaded by `CustomizerPanel` the first time it opens. */
export default function CustomizerPanelBody({ onImport }: { onImport: () => void }) {
  const settings = useCustomizer((state) => state)
  const { presets, fonts } = useKitTheme()
  const fontLabel = (id: string) => fonts.find((font) => font.id === id)?.label ?? id
  const { theme, setTheme } = useTheme()
  const set = (patch: Partial<CustomizerSettings>) => settings.set(patch)
  const presetValue = settings.custom ? "custom" : settings.preset
  const { copied, copy } = useCopied()

  const copyTheme = async () => {
    const preset = findPreset(presets, settings.preset)
    await copy(themeCss(settings.custom?.light ?? preset.light, settings.custom?.dark ?? preset.dark, settings.radius))
    toast.add({ title: "Theme CSS copied", description: "Paste it into app/globals.css to make it the default.", type: "success" })
  }

  return (
    <>
    <div className="flex items-start justify-between gap-2 p-4 pb-3">
      <PopoverHeader className="gap-0.5">
        <PopoverTitle>Theme customizer</PopoverTitle>
        <PopoverDescription>Saved in this browser.</PopoverDescription>
      </PopoverHeader>
      <div className="-me-1.5 -mt-1 flex items-center">
        <IconAction label="Import theme CSS" onClick={onImport}>
          <FileInputIcon />
        </IconAction>
        <IconAction label={copied ? "Theme CSS copied" : "Copy theme CSS"} onClick={copyTheme}>
          <SwapIcon swapped={copied} />
        </IconAction>
        <IconAction label="Reset to defaults" onClick={() => settings.reset()}>
          <RotateCcwIcon />
        </IconAction>
      </div>
    </div>
    <ScrollArea className="h-[min(34rem,calc(var(--available-height)-5.5rem))]">
      <div className="flex flex-col gap-4 px-4 pb-4">
        <Section label="Theme preset">
          <Select
            value={presetValue}
            onValueChange={(value) => {
              if (value && value !== "custom") {
                // A theme comes with the radius it was designed for; the Radius control can still change it.
                crossFade(() => set({ preset: value as string, custom: null, radius: nearestRadius(findPreset(presets, value as string).radius) }))
              }
            }}
          >
            <SelectTrigger className="w-full" aria-label="Theme preset">
              <SelectValue>
                {(value: string) =>
                  value === "custom" ? (
                    "Imported theme"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Swatches colors={findPreset(presets, value).swatches} />
                      {findPreset(presets, value).name}
                    </span>
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {/* The same row as the trigger's: the open list lays the selected item over it, so any difference shows as a jump. */}
                    <span className="flex items-center gap-2">
                      <Swatches colors={preset.swatches} />
                      {preset.name}
                    </span>
                  </SelectItem>
                ))}
                {settings.custom && <SelectItem value="custom">Imported theme</SelectItem>}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Section>

        <Section label="Font">
          <Select value={settings.font} onValueChange={(value) => value && set({ font: value as CustomizerSettings["font"] })}>
            <SelectTrigger className="w-full" aria-label="Font">
              <SelectValue>{(value: CustomizerSettings["font"]) => fontLabel(value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fonts.map((font) => (
                  <SelectItem key={font.id} value={font.id}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Section>

        <Section label="Color mode">
          <Segmented
            aria-label="Color mode"
            value={(theme ?? "system") as "light" | "dark" | "system"}
            onChange={(mode) => crossFade(() => setTheme(mode))}
            options={[
              { value: "light", label: "Light", icon: SunIcon },
              { value: "dark", label: "Dark", icon: MoonIcon },
              { value: "system", label: "System", icon: MonitorIcon },
            ]}
          />
        </Section>

        <Section label="Radius">
          <Segmented aria-label="Radius" value={settings.radius} onChange={(radius) => set({ radius })} options={RADIUS_OPTIONS} />
        </Section>

        <Section label="Content width">
          <Segmented
            aria-label="Content width"
            value={settings.contentWidth}
            onChange={(contentWidth) => set({ contentWidth })}
            options={[
              { value: "contained", label: "Compact" },
              { value: "full", label: "Full" },
            ]}
          />
        </Section>

        <Section label="Scale">
          <Segmented
            aria-label="Scale"
            value={settings.scale}
            onChange={(scale) => set({ scale })}
            options={[
              { value: "sm", label: "SM" },
              { value: "md", label: "MD" },
              { value: "lg", label: "LG" },
            ]}
          />
        </Section>

        <Section label="Layout">
          <Segmented
            aria-label="Layout"
            value={settings.layout}
            onChange={(layout) => set({ layout })}
            options={[
              { value: "sidebar", label: "Sidebar" },
              { value: "top", label: "Top bar" },
            ]}
          />
        </Section>

        {settings.layout === "sidebar" && (
          <>
            <Section label="Sidebar variant">
              <Segmented
                aria-label="Sidebar variant"
                value={settings.sidebarVariant}
                onChange={(sidebarVariant) => set({ sidebarVariant })}
                options={[
                  { value: "sidebar", label: "Default" },
                  { value: "inset", label: "Inset" },
                  { value: "floating", label: "Floating" },
                ]}
              />
            </Section>
            <Section label="Sidebar collapse">
              <Segmented
                aria-label="Sidebar collapse"
                value={settings.sidebarCollapsible}
                onChange={(sidebarCollapsible) => set({ sidebarCollapsible })}
                options={[
                  { value: "icon", label: "Icons" },
                  { value: "offcanvas", label: "Hidden" },
                ]}
              />
            </Section>
          </>
        )}

        <Section label="Direction">
          <Segmented
            aria-label="Direction"
            value={settings.direction}
            onChange={(direction) => set({ direction })}
            options={[
              { value: "ltr", label: "LTR" },
              { value: "rtl", label: "RTL" },
            ]}
          />
        </Section>
      </div>
    </ScrollArea>
    </>
  )
}
