"use client"

import { useEffect } from "react"

import { DataProvider } from "@/kit/data/hooks"
import { startClock } from "@/lib/clock"
import { adapter } from "@/lib/data"

/** The adapter is an object of functions, so it is handed to the Kit from a client component. */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  useEffect(startClock, [])
  return <DataProvider adapter={adapter}>{children}</DataProvider>
}
