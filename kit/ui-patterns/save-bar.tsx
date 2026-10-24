"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/**
 * The bar every edit form shows while it has unsaved changes, plus the guard
 * that stops those changes being lost: closing the tab asks the browser to
 * confirm, and following an in-app link asks first.
 */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  saveLabel = "Save",
  message = "Unsaved changes",
}: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onDiscard: () => void
  saveLabel?: string
  message?: string
}) {
  const leaving = useUnsavedChangesGuard(dirty && !saving)
  return (
    <>
      {dirty && (
        <div
          role="region"
          aria-label="Unsaved changes"
          className="sticky bottom-4 z-10 mx-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl border bg-popover p-2 ps-4 text-popover-foreground shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        >
          <p role="status" className="text-sm font-medium">
            {message}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onDiscard} disabled={saving}>
              Discard
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving && <Spinner data-icon="inline-start" />}
              {saveLabel}
            </Button>
          </div>
        </div>
      )}
      <AlertDialog open={leaving.href !== null} onOpenChange={(open) => !open && leaving.stay()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>Your changes on this page will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={leaving.leave}>
              Leave page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * While `active`, warns before the page is closed and intercepts clicks on
 * in-app links. Next.js has no hook for blocking navigation, so links are
 * caught at the document before the router sees them.
 */
export function useUnsavedChangesGuard(active: boolean) {
  const router = useRouter()
  const [href, setHref] = useState<string | null>(null)

  useEffect(() => {
    if (!active) {
      return
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const anchor = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank" || anchor.origin !== window.location.origin || anchor.hasAttribute("download")) {
        return
      }
      if (anchor.pathname === window.location.pathname && anchor.search === window.location.search) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      setHref(anchor.pathname + anchor.search)
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [active])

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return {
    href,
    stay: () => setHref(null),
    leave: () => {
      const target = href
      setHref(null)
      if (target) {
        // The router adds the base path itself.
        router.push(basePath && target.startsWith(basePath) ? target.slice(basePath.length) || "/" : target)
      }
    },
  }
}
