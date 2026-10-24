"use client"

import { PlusCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

export interface FacetOption {
  value: string
  label: string
  icon?: React.ComponentType
}

/**
 * A toolbar filter with several values: "Payment: Paid, Authorized". The
 * button shows what is chosen, so the active filters read at a glance.
 */
export function FacetedFilter({
  title,
  options,
  value,
  onChange,
  searchable = options.length > 7,
}: {
  title: string
  options: FacetOption[]
  value: string[]
  onChange: (value: string[]) => void
  searchable?: boolean
}) {
  const chosen = options.filter((option) => value.includes(option.value))
  const toggle = (option: string) => onChange(value.includes(option) ? value.filter((entry) => entry !== option) : [...value, option])

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" className="border-dashed" />}>
        <PlusCircleIcon data-icon="inline-start" />
        {title}
        {chosen.length > 0 && (
          <>
            {/* Full height, so the line meets the dashed border top and bottom. */}
            <Separator orientation="vertical" className="mx-1" />
            {chosen.length > 2 ? (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {chosen.length} selected
              </Badge>
            ) : (
              chosen.map((option) => (
                <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                  {option.label}
                </Badge>
              ))
            )}
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          {searchable && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const Icon = option.icon
                return (
                  <CommandItem key={option.value} value={option.label} data-checked={value.includes(option.value)} onSelect={() => toggle(option.value)}>
                    {Icon && <Icon />}
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
