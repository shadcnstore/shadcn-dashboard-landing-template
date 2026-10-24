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

/** Pro: every template and block on shadcnstore.com. */
export const PRO = { href: `${STORE}/pricing`, label: "Compare plans" }
