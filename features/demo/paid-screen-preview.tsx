"use client"

import { ArrowUpRightIcon, LockKeyholeIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/kit/ui-patterns/page-header"

import { PAID_SCREENS, STORE, type PaidScreen } from "./config"
import { trackFunnel } from "./track"

/**
 * A settings screen that ships in the paid templates, not in Chronicle. The
 * page says so plainly and shows the real screen; nothing here pretends to be
 * a working feature behind a lock.
 */
export function PaidScreenPreview({ screen }: { screen: PaidScreen }) {
  const info = PAID_SCREENS[screen]
  return (
    <>
      <PageHeader title={info.title} meta={<Badge variant="secondary">In the paid templates</Badge>} description="This screen is not part of the free Chronicle template." />
      <Card className="rounded-2xl shadow-(--surface-shadow) ring-foreground/5">
        <CardContent className="flex flex-col gap-5">
          <p className="max-w-prose text-sm">{info.body}</p>
          {info.image ? (
            // A remote screenshot on the demo only; the template you download never loads it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={info.image} alt={info.alt} width={1280} height={800} loading="lazy" className="w-full rounded-xl border" />
          ) : (
            <div className="flex aspect-[16/7] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              <LockKeyholeIcon className="me-2 size-4" aria-hidden />
              No preview image for this screen yet
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Link href="/go-further" className={buttonVariants()} onClick={() => trackFunnel("preview-further", { target: screen })}>
              Compare free and paid
            </Link>
            <a href={`${STORE}/templates/dashboards/emporium`} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline" })} onClick={() => trackFunnel("preview-template", { target: screen })}>
              See it in Emporium
              <ArrowUpRightIcon data-icon="inline-end" />
            </a>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
