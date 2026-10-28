import { HelpCircleIcon, MailIcon, PlayCircleIcon } from "lucide-react"
import Link from "next/link"

import { ContactForm } from "./contact-form"
import { Section, SectionHeading } from "./section-heading"

const OPTIONS = [
  {
    icon: MailIcon,
    title: "Email the team",
    description: "A person replies within one business day.",
    link: { label: "hello@chronicle.example", href: "mailto:hello@chronicle.example" },
  },
  {
    icon: PlayCircleIcon,
    title: "Try it with sample data",
    description: "The full dashboard, loaded with a year of demo revenue.",
    link: { label: "Open the dashboard", href: "/" },
  },
  {
    icon: HelpCircleIcon,
    title: "Read the FAQ",
    description: "Billing connections, definitions and data handling.",
    link: { label: "Go to the FAQ", href: "#faq" },
  },
]

export function Contact() {
  return (
    <Section id="contact">
      <SectionHeading eyebrow="Contact" title="Talk to the people who build it" lede="Questions about pricing, a migration, or a metric that looks off? Send a note." />
      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <ul className="flex flex-col gap-4">
          {OPTIONS.map((option) => (
            <li key={option.title} className="flex gap-4 rounded-xl border bg-card p-5 shadow-(--surface-shadow)">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <option.icon className="size-4.5" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-medium">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                {option.link.href.startsWith("/") ? (
                  <Link href={option.link.href} className="mt-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
                    {option.link.label}
                  </Link>
                ) : (
                  <a href={option.link.href} className="mt-1 truncate text-sm font-medium text-primary underline-offset-4 hover:underline">
                    {option.link.label}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border bg-card p-6 shadow-(--surface-shadow) sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  )
}
