import type { Metadata } from "next"

import { UserPage } from "@/features/users/user-page"

export const metadata: Metadata = { title: "User" }

/** The static demo exports one placeholder page; it reads the real id from the address (kit/data/use-route-id). */
export function generateStaticParams() {
  return [{ id: "_" }]
}

export default function Page() {
  return <UserPage />
}
