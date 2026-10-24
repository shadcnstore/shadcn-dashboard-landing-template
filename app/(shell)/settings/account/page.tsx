import type { Metadata } from "next"

import { SITE } from "@/config/site"
import { AccountPage } from "@/kit/account/account-page"

export const metadata: Metadata = { title: "Account and security" }

export default function Page() {
  return (
    <AccountPage
      user={SITE.user}
      profileNote="Your profile is how the rest of the Tidewell team sees you on tasks, account notes and the activity log."
    />
  )
}
