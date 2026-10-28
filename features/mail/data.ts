import { DATA_NOW } from "@/lib/clock"

/**
 * Maya Okafor's mailbox at Chronicle. Every timestamp is built back from
 * DATA_NOW, so the inbox reads the same on every visit. Customer accounts are
 * fictional two-word names; every address ends in example.com.
 */

export type MailFolder = "inbox" | "drafts" | "sent" | "archive" | "trash"
export type MailLabel = "renewals" | "billing" | "support" | "product"

export interface MailAccountContext {
  name: string
  plan: "Starter" | "Growth" | "Scale"
  mrrCents: number
  seats: number
  seatLimit: number
  renewsOn: string
}

export interface Mail {
  id: string
  folder: MailFolder
  from: { name: string; email: string }
  to: string
  subject: string
  /** Paragraphs of the body. */
  body: string[]
  date: string
  read: boolean
  starred: boolean
  labels: MailLabel[]
  account?: MailAccountContext
  attachments?: { name: string; size: string }[]
}

export const ME = { name: "Maya Okafor", email: "maya.okafor@example.com" }

/** An ISO time `days` before DATA_NOW at a fixed UTC clock time. */
function at(days: number, time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const date = new Date(DATA_NOW.getTime())
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const LABELS: { id: MailLabel; title: string; tone: string }[] = [
  { id: "renewals", title: "Renewals", tone: "bg-primary" },
  { id: "billing", title: "Billing", tone: "bg-chart-2" },
  { id: "support", title: "Support", tone: "bg-warning" },
  { id: "product", title: "Product", tone: "bg-chart-3" },
]

export const MAILS: Mail[] = [
  {
    id: "m01",
    folder: "inbox",
    from: { name: "Ines Moreau", email: "ines.moreau@kestrelfreight.example.com" },
    to: ME.email,
    subject: "Renewal: moving our 40 seats to Scale",
    date: at(0, "11:36"),
    read: false,
    starred: true,
    labels: ["renewals"],
    account: { name: "Kestrel Freight", plan: "Growth", mrrCents: 184000, seats: 38, seatLimit: 40, renewsOn: "Nov 1, 2026" },
    body: [
      "Hi Maya,",
      "We have been on Growth since last spring and the team now lives in the cohort reports. Ahead of our renewal on 1 November we would like to move all 40 seats to Scale, mostly for SSO and the longer data retention.",
      "Two questions before I take it to finance: can we switch to annual invoicing at the same time, and would the seat price hold if we add another 15 seats in Q1?",
      "If it is easier to talk it through, I am free Thursday afternoon.",
      "Thanks,\nInes",
    ],
  },
  {
    id: "m02",
    folder: "inbox",
    from: { name: "Tariq Haddad", email: "tariq.haddad@example.com" },
    to: ME.email,
    subject: "Payment retries recovered $4,120 overnight",
    date: at(0, "10:52"),
    read: false,
    starred: false,
    labels: ["billing"],
    body: [
      "Morning Maya,",
      "The new 24 hour retry window ran for the first time last night. 31 of the 44 failed card payments went through on the second attempt, which is $4,120 of MRR we would otherwise have chased by hand.",
      "The remaining 13 are mostly expired cards. Diego's team has the list and the reminder emails go out at 14:00 UTC.",
      "I will post the full numbers in the billing channel once the week closes.",
      "Tariq",
    ],
  },
  {
    id: "m03",
    folder: "inbox",
    from: { name: "Chronicle Billing", email: "billing@chronicle.example.com" },
    to: ME.email,
    subject: "3 card payments failed for Scale accounts",
    date: at(0, "09:15"),
    read: false,
    starred: false,
    labels: ["billing"],
    body: [
      "Three payments failed in the last 24 hours on accounts with an MRR above $1,000.",
      "Basalt Energy: $2,450.00, card declined\nHarrow Insurance: $1,890.00, insufficient funds\nTimberline Robotics: $1,320.00, card expired",
      "Each account owner has been emailed. Payments are retried automatically after 24 hours.",
    ],
  },
  {
    id: "m04",
    folder: "inbox",
    from: { name: "Diego Marquez", email: "diego.marquez@example.com" },
    to: ME.email,
    subject: "Churn risk: Cobble Learning has gone quiet",
    date: at(0, "07:48"),
    read: false,
    starred: false,
    labels: ["support"],
    account: { name: "Cobble Learning", plan: "Growth", mrrCents: 96000, seats: 22, seatLimit: 30, renewsOn: "Dec 4, 2026" },
    body: [
      "Hi Maya,",
      "Nobody at Cobble Learning has signed in for 21 days. Their champion, Esme, left in September and the new owner has not accepted the invitation yet.",
      "I would like to offer them a 30 minute walkthrough and a temporary extra admin seat. Are you happy for me to go ahead?",
      "Diego",
    ],
  },
  {
    id: "m05",
    folder: "inbox",
    from: { name: "Hana Sato", email: "hana.sato@example.com" },
    to: ME.email,
    subject: "Saltmarsh Health asks for a pilot extension",
    date: at(1, "16:20"),
    read: true,
    starred: true,
    labels: ["renewals"],
    account: { name: "Saltmarsh Health", plan: "Scale", mrrCents: 0, seats: 12, seatLimit: 25, renewsOn: "Oct 31, 2026" },
    body: [
      "Maya,",
      "Saltmarsh Health want two more weeks on the Scale trial. Their security review only started last Friday and procurement will not sign before it closes.",
      "I think it is worth it: they have 12 active seats already and the budget is approved for 25. I will extend to 14 November unless you object.",
      "Hana",
    ],
  },
  {
    id: "m06",
    folder: "inbox",
    from: { name: "Priya Iyer", email: "priya.iyer@example.com" },
    to: ME.email,
    subject: "Seat limit banner: three directions for review",
    date: at(1, "14:05"),
    read: true,
    starred: false,
    labels: ["product"],
    attachments: [
      { name: "seat-banner-directions.pdf", size: "2.4 MB" },
      { name: "banner-mobile.png", size: "640 KB" },
    ],
    body: [
      "Hi Maya,",
      "Attached are three directions for the seat limit banner. The current one overlaps the header on small screens and owners told us it reads like an error.",
      "My favourite is B: a quiet inline notice on the users page with one action, plus an email to the owner at 90% of the limit.",
      "Could you leave comments by Thursday? Emeka is ready to build whichever we pick.",
      "Priya",
    ],
  },
  {
    id: "m07",
    folder: "inbox",
    from: { name: "Freya Dahl", email: "freya.dahl@example.com" },
    to: ME.email,
    subject: "October cohort retention is up 3.2 points",
    date: at(1, "10:40"),
    read: true,
    starred: false,
    labels: ["product"],
    body: [
      "Quick one before the weekly review:",
      "Accounts that started in October are retaining at 91.4% after their first month, up from 88.2% for September. Most of the lift comes from accounts that finished the onboarding checklist.",
      "I have added the breakdown to the analytics page under Retention. Happy to walk through it on Friday.",
      "Freya",
    ],
  },
  {
    id: "m08",
    folder: "inbox",
    from: { name: "Rosa Castellano", email: "rosa@heronclinics.example.com" },
    to: ME.email,
    subject: "Invoice INV-2026-0412 shows the wrong VAT number",
    date: at(1, "08:12"),
    read: true,
    starred: false,
    labels: ["billing", "support"],
    account: { name: "Heron Clinics", plan: "Scale", mrrCents: 312000, seats: 64, seatLimit: 80, renewsOn: "Mar 12, 2027" },
    body: [
      "Hello,",
      "Our October invoice still carries our old VAT number. Could you reissue it with the one on file since August? Our accounts team cannot process it otherwise.",
      "Kind regards,\nRosa Castellano\nFinance, Heron Clinics",
    ],
  },
  {
    id: "m09",
    folder: "inbox",
    from: { name: "Soren Lindqvist", email: "soren.lindqvist@example.com" },
    to: ME.email,
    subject: "Incident review: webhook delays on 14 October",
    date: at(2, "17:30"),
    read: true,
    starred: false,
    labels: ["product"],
    body: [
      "Hi all,",
      "The write-up for last Wednesday's webhook delays is in the engineering wiki. Short version: a queue worker stalled after a deploy and plan change events were delayed by up to 38 minutes for 112 accounts. No events were lost.",
      "We have added an alert on queue age and a health check to the deploy step. Customer success has the list of affected accounts.",
      "Soren",
    ],
  },
  {
    id: "m10",
    folder: "inbox",
    from: { name: "Nikhil Rahman", email: "nikhil@juniperpayments.example.com" },
    to: ME.email,
    subject: "Question about the export API rate limits",
    date: at(3, "13:02"),
    read: true,
    starred: false,
    labels: ["support"],
    account: { name: "Juniper Payments", plan: "Scale", mrrCents: 248000, seats: 51, seatLimit: 60, renewsOn: "Jan 20, 2027" },
    body: [
      "Hi Maya,",
      "We are building a nightly sync from the export API into our warehouse. The docs say 60 requests a minute: is that per key or per account? We have three keys for different teams.",
      "Thanks,\nNikhil",
    ],
  },
  {
    id: "m11",
    folder: "inbox",
    from: { name: "Emeka Bello", email: "emeka.bello@example.com" },
    to: ME.email,
    subject: "Shipped: dark mode contrast on chart tooltips",
    date: at(4, "15:44"),
    read: true,
    starred: false,
    labels: ["product"],
    body: ["The tooltip contrast fix is live. Every chart tooltip now passes 4.5:1 in dark mode, and the series swatches have a hairline border so they read on any card colour.", "Emeka"],
  },
  {
    id: "m12",
    folder: "inbox",
    from: { name: "Camille Novak", email: "camille@larkspurdesign.example.com" },
    to: ME.email,
    subject: "Thank you for the onboarding session",
    date: at(5, "09:20"),
    read: true,
    starred: false,
    labels: [],
    account: { name: "Larkspur Design", plan: "Starter", mrrCents: 24000, seats: 6, seatLimit: 10, renewsOn: "Oct 28, 2026" },
    body: ["Hi Maya,", "Thank you for Tuesday's session. The team set up their first saved views the same afternoon and our weekly report now takes ten minutes instead of an hour.", "Best,\nCamille"],
  },
  {
    id: "m13",
    folder: "inbox",
    from: { name: "Kai Wada", email: "kai.wada@northgatelogistics.example.com" },
    to: ME.email,
    subject: "Downgrading to Growth next cycle",
    date: at(6, "11:10"),
    read: true,
    starred: false,
    labels: ["renewals"],
    account: { name: "Northgate Logistics", plan: "Scale", mrrCents: 156000, seats: 18, seatLimit: 40, renewsOn: "Nov 9, 2026" },
    body: [
      "Hello Maya,",
      "After the restructure we are down to 18 people who use Chronicle, so we plan to move to Growth at our next renewal. We would like to keep our saved views and the exports history.",
      "Can you confirm nothing is lost in the switch?",
      "Kai",
    ],
  },
  {
    id: "m14",
    folder: "inbox",
    from: { name: "Chronicle Security", email: "security@chronicle.example.com" },
    to: ME.email,
    subject: "New sign-in to the Chronicle admin",
    date: at(8, "06:58"),
    read: true,
    starred: false,
    labels: [],
    body: ["We noticed a new sign-in to your account.", "Device: desktop browser\nLocation: Lisbon, Portugal\nTime: 06:58 UTC", "If this was you, there is nothing to do. If not, reset your password and review your active sessions in Settings."],
  },
  {
    id: "m15",
    folder: "drafts",
    from: ME,
    to: "ines.moreau@kestrelfreight.example.com",
    subject: "Re: Renewal: moving our 40 seats to Scale",
    date: at(0, "11:58"),
    read: true,
    starred: false,
    labels: ["renewals"],
    body: ["Hi Ines,", "Great to hear the team relies on the cohort reports. Yes to annual invoicing, and we can lock the seat price for additions through March. I will send"],
  },
  {
    id: "m16",
    folder: "drafts",
    from: ME,
    to: "team@example.com",
    subject: "Q4 renewals plan",
    date: at(2, "09:30"),
    read: true,
    starred: false,
    labels: ["renewals"],
    body: ["Team,", "Twelve accounts renew before the end of November. Owners and next steps below."],
  },
  {
    id: "m17",
    folder: "sent",
    from: ME,
    to: "hana.sato@example.com",
    subject: "Re: Saltmarsh Health asks for a pilot extension",
    date: at(1, "16:48"),
    read: true,
    starred: false,
    labels: ["renewals"],
    body: ["Agreed, extend to 14 November. Please loop me into the security review call.", "Maya"],
  },
  {
    id: "m18",
    folder: "sent",
    from: ME,
    to: "rosa@heronclinics.example.com",
    subject: "Re: Invoice INV-2026-0412 shows the wrong VAT number",
    date: at(1, "09:05"),
    read: true,
    starred: false,
    labels: ["billing"],
    body: ["Hi Rosa,", "Sorry about that. Tariq is reissuing the invoice with the updated VAT number today; you will have it by 17:00 UTC.", "Maya"],
  },
  {
    id: "m19",
    folder: "archive",
    from: { name: "Thea Saarinen", email: "thea@willowmerehomes.example.com" },
    to: ME.email,
    subject: "Signed order form attached",
    date: at(12, "14:22"),
    read: true,
    starred: false,
    labels: ["renewals"],
    attachments: [{ name: "order-form-willowmere.pdf", size: "180 KB" }],
    body: ["Hi Maya,", "Please find the signed order form attached. Looking forward to getting started.", "Thea"],
  },
]
