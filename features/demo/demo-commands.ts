"use client"

import { StarIcon, LayersIcon, SparklesIcon } from "lucide-react"
import { useMemo } from "react"

import type { CommandAction } from "@/kit/command/command-menu"

import { isDemo, PRO, REPO, STORE } from "./config"
import { trackFunnel } from "./track"

function open(href: string, placement: string) {
  trackFunnel(placement)
  window.open(href, "_blank", "noopener")
}

/** A "ShadcnStore" group in ⌘K, in the public demo only. */
export function useDemoCommands(): CommandAction[] {
  return useMemo(
    () =>
      isDemo
        ? [
            { id: "demo-github", title: "Get Chronicle on GitHub", icon: StarIcon, group: "ShadcnStore", run: () => open(REPO, "command-github") },
            { id: "demo-templates", title: "Browse the paid dashboard templates", icon: LayersIcon, group: "ShadcnStore", run: () => open(`${STORE}/templates/dashboards`, "command-templates") },
            { id: "demo-pro", title: "Compare plans", icon: SparklesIcon, group: "ShadcnStore", run: () => open(PRO.href, "command-pro") },
          ]
        : [],
    []
  )
}
