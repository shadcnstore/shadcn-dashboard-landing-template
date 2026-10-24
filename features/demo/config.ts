/**
 * Where the public demo points people. Only the demo build (DEMO_BUILD=1)
 * shows any of it; your own build never renders these links.
 */
export const isDemo = process.env.NEXT_PUBLIC_DEMO === "1"

export const STORE = "https://shadcnstore.com"
export const REPO = "https://github.com/shadcnstore/shadcn-dashboard-landing-template"

export interface PaidTemplate {
  slug: string
  name: string
  kind: string
  /** What it adds over Chronicle, in one line. */
  adds: string
  href: string
  /** Live templates show a price and a demo; unlaunched ones show "Coming soon". */
  live: boolean
  price?: string
  demo?: string
  /** Screens it has that Chronicle does not. */
  screens: string[]
}

/** Flip `live` and set `price` and `demo` when a template launches (LAUNCH.md). */
export const PAID_TEMPLATES: PaidTemplate[] = [
  {
    slug: "emporium",
    name: "Emporium",
    kind: "E-commerce admin",
    adds: "A whole store: orders, products, customers, returns, and an assistant that drafts changes for your approval.",
    href: `${STORE}/templates/dashboards/emporium`,
    live: true,
    price: "$79",
    demo: "https://demo.shadcnstore.com/emporium/",
    screens: ["Orders and returns", "Product editor", "Store assistant", "Team and roles", "Billing and plans", "API keys"],
  },
  {
    slug: "rapport",
    name: "Rapport",
    kind: "AI-native CRM",
    adds: "Pipeline, forecast and a deal agent that proposes updates as approval cards, on a warm editorial theme.",
    href: `${STORE}/templates/dashboards/rapport`,
    live: false,
    screens: ["Pipeline board", "Forecast", "Deal agent", "Team and quotas", "Billing and plans", "API keys"],
  },
]

/** Pro: every template and block on shadcnstore.com, one payment. */
export const PRO = { href: `${STORE}/pricing`, label: "Compare plans", price: "$149", note: "One payment, every template and block" }

const SCREENS = "https://assets.shadcnstore.com/shadcnstore.com/templates/emporium/screens"

/** Screens that exist in the paid templates and not in Chronicle. Shown as previews in the demo's settings. */
export const PAID_SCREENS = {
  team: {
    title: "Team and roles",
    body: "Invite teammates, set roles with a permission matrix, and see who has access. Emporium and Rapport ship it, wired to their own data.",
    image: `${SCREENS}/team.1280w.3e3b13.webp`,
    alt: "The Team settings screen in Emporium: members, roles and a permission matrix",
  },
  billing: {
    title: "Billing and plans",
    body: "Plan cards, usage meters, the payment method, invoices and a change-plan flow with a proration summary.",
    image: `${SCREENS}/plans.1280w.e99699.webp`,
    alt: "The Plans screen in Emporium: current plan, usage and plan comparison",
  },
  "api-keys": {
    title: "API keys",
    body: "Create keys with scopes, show the secret once, revoke, and watch each key's last use. Part of the paid templates' organisation settings.",
    image: null,
    alt: "",
  },
} as const

export type PaidScreen = keyof typeof PAID_SCREENS
