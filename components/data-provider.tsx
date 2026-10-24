"use client"

import { DataProvider } from "@/kit/data/hooks"
import { adapter } from "@/lib/data"

/** The adapter is an object of functions, so it is handed to the Kit from a client component. */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  return <DataProvider adapter={adapter}>{children}</DataProvider>
}
