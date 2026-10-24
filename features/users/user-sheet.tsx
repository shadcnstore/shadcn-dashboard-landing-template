"use client"

import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Account } from "@/data/schema"

import { UserDetail } from "./user-detail"

/** The record beside the table, so the list keeps its place. */
export function UserSheet({ id, account, onOpenChange }: { id: string | null; account?: Account; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={id !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>User</SheetTitle>
          <SheetDescription>Profile, role and the account they belong to.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">{id && <UserDetail id={id} account={account} />}</div>
        {id && (
          <SheetFooter className="border-t">
            <Link href={`/users/${id}`} className={buttonVariants({ variant: "outline" })}>
              Open full page
              <ArrowUpRightIcon data-icon="inline-end" />
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
