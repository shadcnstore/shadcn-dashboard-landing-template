"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { SettingsSkeleton } from "@/kit/settings/section"

/** /settings has no page of its own; the static export cannot redirect on the server, so it happens here. */
export function SettingsRedirect({ to }: { to: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(to)
  }, [router, to])
  return <SettingsSkeleton />
}
