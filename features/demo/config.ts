/**
 * Where the public demo points people. Only the demo build (DEMO_BUILD=1)
 * shows any of it; your own build never renders these links.
 */
export const isDemo = process.env.NEXT_PUBLIC_DEMO === "1"

export const STORE = "https://shadcnstore.com"
export const REPO = "https://github.com/shadcnstore/shadcn-dashboard-landing-template"

export type TemplateStatus = "live" | "soon"

export interface PaidTemplate {
  slug: string
  name: string
  /** What kind of product it is, in two or three words. */
  kind: string
  /** What it is for, in one sentence. */
  pitch: string
  /** What you get that Chronicle does not have. */
  adds: string[]
  /** The template's page on shadcnstore.com; unlaunched ones without a page point at the catalogue. */
  href: string
  /** "live" shows the price and the live demo; "soon" shows "Coming soon, included in Pro". */
  status: TemplateStatus
  /** One-time price in US dollars, live templates only. */
  price?: number
  demo?: string
  /** A real screenshot, bundled for the demo (public/demo/products). */
  image: string
}

const IMAGES = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/demo/products`

/**
 * Every paid template the demo shows, in one place. Launch day is one edit:
 * set `status: "live"`, the `price`, the `demo` and the `href` (LAUNCH.md).
 */
export const PAID_TEMPLATES: PaidTemplate[] = [
  {
    slug: "emporium",
    name: "Emporium",
    kind: "E-commerce admin",
    pitch: "The admin for an online store, working end to end on a year of one store's data.",
    adds: ["Orders, returns and fulfilment", "Products, inventory and collections", "A store assistant that drafts changes for your approval", "Team, billing and API-key settings"],
    href: `${STORE}/templates/dashboards/emporium`,
    status: "live",
    price: 79,
    demo: "https://demo.shadcnstore.com/emporium/",
    image: `${IMAGES}/emporium.webp`,
  },
  {
    slug: "rapport",
    name: "Rapport",
    kind: "AI-native CRM",
    pitch: "A sales CRM where the pipeline reconciles with the forecast and an agent proposes the updates.",
    adds: ["Pipeline board and forecast", "A deal agent that proposes changes as approval cards", "Companies, people and deal records", "Team, quotas, billing and API keys"],
    href: `${STORE}/templates/dashboards/rapport`,
    status: "soon",
    image: `${IMAGES}/rapport.webp`,
  },
  {
    slug: "plinth",
    name: "Plinth",
    kind: "E-commerce storefront",
    pitch: "The shop your customers see, made as the storefront that pairs with Emporium.",
    adds: ["Editorial home, collections and product pages", "Bag, checkout and account", "Shoppable look-to-cart scenes", "The same catalogue as Emporium"],
    href: `${STORE}/templates`,
    status: "soon",
    image: `${IMAGES}/plinth.webp`,
  },
  {
    slug: "synapse",
    name: "Synapse",
    kind: "AI product site",
    pitch: "A multi-page marketing site for an AI agent product, with the product working in the hero.",
    adds: ["A scripted agent demo in the hero", "Product, customers, pricing and security pages", "Changelog and contact", "A dark, characterful theme"],
    href: `${STORE}/templates/landing-pages/synapse`,
    status: "soon",
    image: `${IMAGES}/synapse.webp`,
  },
  {
    slug: "momentum",
    name: "Momentum",
    kind: "Mobile app landing",
    pitch: "A landing page that shows a mobile app on screen and sends people to the stores.",
    adds: ["Phone mock with real app screens", "Features, how it works and pricing", "App Store and Google Play calls to action", "A soft, tactile theme"],
    href: `${STORE}/templates`,
    status: "soon",
    image: `${IMAGES}/momentum.webp`,
  },
]

/** Pro: every template and block on shadcnstore.com, one payment. */
export const PRO = {
  href: `${STORE}/pricing`,
  price: "$149",
  /** From the Pro plan on shadcnstore.com/pricing. Keep in step with it. */
  includes: [
    "Every paid template's code and design, including the ones above as they launch",
    "Every premium block, and the Figma UI kit",
    "Lifetime access and lifetime updates",
    "Unlimited projects, one developer and one designer licence",
  ],
}

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
