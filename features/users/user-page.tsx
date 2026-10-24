"use client"

import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouteId } from "@/kit/data/use-route-id"
import { PageHeader } from "@/kit/ui-patterns/page-header"

import { UserDetail } from "./user-detail"

export function UserPage() {
  const id = useRouteId()
  return (
    <>
      <PageHeader
        title="User"
        description="Profile, role and account."
        actions={
          <Link href="/users" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeftIcon data-icon="inline-start" className="rtl:-scale-x-100" />
            All users
          </Link>
        }
      />
      <Card className="max-w-2xl">
        <CardContent>{id && <UserDetail id={id} />}</CardContent>
      </Card>
    </>
  )
}
