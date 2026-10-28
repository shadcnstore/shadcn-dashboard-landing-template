import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { REPO } from "@/features/demo/config"

import { NewsletterForm } from "./newsletter-form"
import { BrandCredit, BrandLogo } from "@/components/chronicle/brand-logo"
import { BRAND } from "@/config/brand"

type FooterLink = { label: string; href: string }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Customers", href: "#customers" },
      { label: "Dashboard", href: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Team", href: "#team" },
      { label: "Journal", href: "#journal" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create an account", href: "/sign-up" },
      { label: "Reset password", href: "/forgot-password" },
      { label: "FAQ", href: "#faq" },
    ],
  },
]

function FooterAnchor({ link }: { link: FooterLink }) {
  const className = "text-sm text-muted-foreground transition-colors hover:text-foreground"
  return link.href.startsWith("/") ? (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-card/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex max-w-sm flex-col gap-4">
            <BrandLogo />
            <p className="text-sm text-pretty text-muted-foreground">{BRAND.tagline}. Get the journal once a month.</p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
                <h2 className="text-sm font-medium">{column.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {BRAND.name} is the sample product in the{" "}
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
              {BRAND.name} template
            </a>
            , free and MIT licensed.
          </p>
          <BrandCredit />
        </div>
      </div>
    </footer>
  )
}
