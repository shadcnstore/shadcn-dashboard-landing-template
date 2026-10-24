import type { Metadata } from "next"
import { Suspense } from "react"

import { UsersPage } from "@/features/users/users-page"

export const metadata: Metadata = { title: "Users" }

export default function Page() {
  return (
    <Suspense>
      <UsersPage />
    </Suspense>
  )
}
