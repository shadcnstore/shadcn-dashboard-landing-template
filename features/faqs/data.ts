import { CreditCardIcon, LayersIcon, ShieldCheckIcon, UserCogIcon } from "lucide-react"
import type { ComponentType } from "react"

import { TRIAL_DAYS } from "@/data/generate"

/**
 * Chronicle's help centre: one list for the FAQs page and the landing page's
 * FAQ section, so the two never disagree with each other or with the plans
 * in data/generate.ts.
 */
export type CategoryId = "billing" | "plans" | "data" | "account"

export const CATEGORIES: { id: CategoryId; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "plans", label: "Plans and seats", icon: LayersIcon },
  { id: "data", label: "Data and security", icon: ShieldCheckIcon },
  { id: "account", label: "Your account", icon: UserCogIcon },
]

/** The questions Chronicle's customers actually ask. Replace with your product's. */
export const FAQS: { category: CategoryId; question: string; answer: string }[] = [
  { category: "billing", question: "When am I charged?", answer: `Your first charge is at the end of the ${TRIAL_DAYS}-day trial, and then on the same day each month, or each year on yearly billing. Seats you add mid-cycle are charged on the next invoice.` },
  { category: "billing", question: "What happens when a card payment fails?", answer: "We retry the card after 24 hours, then after three and seven days. In the meantime the account shows as past due on the Overview and the owner gets an email with a link to update the card. Nothing is locked while we retry." },
  { category: "billing", question: "Can I pay yearly?", answer: "Yes. Yearly billing costs ten months of the plan's price for twelve months of use. Switch on the Pricing page or in Settings, and the change applies from your next renewal." },
  { category: "billing", question: "Where do I find my invoices?", answer: "Owners and admins see every invoice under Settings, with a PDF for each one. Invoices go to the billing email as well, and you can add a second address for your finance team." },
  { category: "plans", question: "What counts as a seat?", answer: "Every active user on your account. Invited users who have not signed in yet and suspended users do not count, so you can prepare invitations before you pay for them." },
  { category: "plans", question: "What happens if we go over our seat limit?", answer: "Nobody is blocked. The account shows as over its limit, the owner is told, and they can raise the limit with one click. Extra seats are billed at your plan's seat price from the next invoice." },
  { category: "plans", question: "Can I change plans later?", answer: "Any time. An upgrade starts straight away and you pay the difference for the rest of the period. A downgrade starts at the end of the period, so you keep what you paid for." },
  { category: "plans", question: "Is there a free trial?", answer: `Every plan starts with a ${TRIAL_DAYS}-day trial with no card needed. At the end of the trial you choose a plan, or the account pauses and keeps your data for 30 days.` },
  { category: "data", question: "Where does my revenue data come from?", answer: "From your billing provider, connected read-only under Settings, Connections. Subscriptions, invoices and failed payments sync every few minutes, and every figure on the dashboard traces back to them." },
  { category: "data", question: "Which billing platforms does Chronicle connect to?", answer: "Chronicle connects read-only to the major subscription billing platforms and payment processors, and imports a CSV for anything else. Most teams are connected in under fifteen minutes." },
  { category: "data", question: "Will the numbers match my accounting system?", answer: "Yes. Every metric reconciles to invoices, credit notes and refunds, and the exports tie back to the totals on screen. When something cannot reconcile, Chronicle flags the invoice instead of guessing." },
  { category: "data", question: "How is MRR calculated?", answer: "MRR is the monthly value of every active subscription after discounts and before tax. Yearly plans are spread evenly over twelve months, trials count as zero and one-off charges are left out." },
  { category: "data", question: "Do you support single sign-on?", answer: "Yes, on the Scale plan, together with an audit log of every sign-in, role change and export. Two-step sign-in is available on every plan." },
  { category: "data", question: "Can I export my data?", answer: "Growth and Scale export any table as CSV. Scale also syncs accounts, users and MRR movement to your data warehouse every night." },
  { category: "account", question: "How do I invite teammates?", answer: "Open Users and choose Invite, or press Command K and type invite. Pick a role for each person; they get an email and count as a seat once they sign in." },
  { category: "account", question: "Who can change billing?", answer: "The account owner and admins. Members and viewers can see the plan but not change it, and only the owner can cancel." },
  { category: "account", question: "How do I transfer ownership?", answer: "The current owner makes another admin the owner from that person's page in Users. The previous owner stays on as an admin." },
  { category: "account", question: "How do I close my account?", answer: "The owner cancels from Settings. Your data stays available for export for 30 days, then it is deleted and we confirm by email." },
]

/** The six the landing page shows, in its order. Each must be a question above (features/faqs/data.test.ts). */
export const LANDING_QUESTIONS = [
  "Which billing platforms does Chronicle connect to?",
  "How is MRR calculated?",
  "Will the numbers match my accounting system?",
  "What counts as a seat?",
  "Is there a free trial?",
  "Can I export my data?",
]

export const LANDING_FAQS = LANDING_QUESTIONS.map((question) => FAQS.find((faq) => faq.question === question)).filter((faq) => faq !== undefined)
