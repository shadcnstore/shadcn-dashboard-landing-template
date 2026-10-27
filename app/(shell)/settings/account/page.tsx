import type { Metadata } from "next"

import { SITE } from "@/config/site"
import { AccountPage } from "@/features/settings/account-page"

export const metadata: Metadata = { title: "Account and security" }

/**
 * The Kit's account page splits on viewport breakpoints, but beside the app
 * sidebar and the settings menu it gets about 480px at 768 and 1024. These
 * overrides key the splits to the width the page actually has instead.
 */
const FIT_TO_WIDTH = [
  // Profile summary and security checkup side by side only from 768px of content.
  "[&>[data-slot=card]:first-child]:flex-col @3xl/account:[&>[data-slot=card]:first-child]:flex-row",
  "[&>[data-slot=card]:first-child>div:first-child]:w-auto @3xl/account:[&>[data-slot=card]:first-child>div:first-child]:w-2/5",
  "[&>[data-slot=card]:first-child>div:nth-child(2)]:border-s-0 [&>[data-slot=card]:first-child>div:nth-child(2)]:border-t",
  "@3xl/account:[&>[data-slot=card]:first-child>div:nth-child(2)]:border-s @3xl/account:[&>[data-slot=card]:first-child>div:nth-child(2)]:border-t-0",
  // The three checks read as a list, so labels and details never wrap or clip to "On, wit...".
  "[&>[data-slot=card]:first-child_ul]:grid-cols-1",
  "[&>[data-slot=card]:first-child_li]:flex-row [&>[data-slot=card]:first-child_li]:items-center [&>[data-slot=card]:first-child_li]:gap-2.5 [&>[data-slot=card]:first-child_li]:py-2.5",
  "[&>[data-slot=card]:first-child_li>span:nth-child(2)]:shrink-0 [&>[data-slot=card]:first-child_li>span:last-child]:ms-auto",
  // Three password fields share a row only when each gets enough room for its label.
  "[&_#password-form>[data-slot=field-group]]:grid-cols-1 @2xl/account:[&_#password-form>[data-slot=field-group]]:grid-cols-3",
].join(" ")

export default function Page() {
  return (
    <div className={`@container/account flex min-w-0 flex-col gap-4 ${FIT_TO_WIDTH}`}>
      <AccountPage
        user={SITE.user}
        profileNote="Your profile is how the rest of the Tidewell team sees you on tasks, account notes and the activity log."
      />
    </div>
  )
}
