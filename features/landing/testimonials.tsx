import { PersonAvatar } from "@/components/chronicle/person-avatar"

import { Section, SectionHeading } from "./section-heading"

/** Customer quotes. People and companies are fictional, matching the logo row. */
const QUOTES = [
  {
    name: "Priya Raman",
    role: "VP Finance, Fernwick",
    quote: "Our month-end close went from four days to one afternoon. The MRR number finally matches what the bank says.",
  },
  {
    name: "Tomas Lindqvist",
    role: "Head of Growth, Saltgrove",
    quote: "Cohorts split by plan showed us annual customers retain twice as well. We changed our pricing page the same week.",
  },
  {
    name: "Rosa Osei",
    role: "Founder, Quillmark",
    quote: "I connected billing on a Sunday night and had a board-ready revenue chart before breakfast.",
  },
  {
    name: "Samuel Alvarez",
    role: "RevOps Lead, Marrowby",
    quote:
      "Versioned metric definitions ended the argument about what counts as churn. When finance changes a rule, everyone sees the before and after, and nobody has to rebuild a spreadsheet.",
  },
  {
    name: "Isla Whitfield",
    role: "CFO, Tessellate",
    quote: "Multi-currency used to be a quarterly headache. Now it is a setting.",
  },
  {
    name: "Daniel Brennan",
    role: "Data Lead, Juniper Row",
    quote: "The exports balance to the cent. Our auditors asked which tool we used, which has never happened before.",
  },
]

export function Testimonials() {
  return (
    <Section id="customers" labelledBy="customers-title">
      <SectionHeading id="customers-title" eyebrow="Customers" title="Teams that stopped arguing about the numbers" lede="Finance, growth and success teams on how Chronicle changed their month." />
      <ul className="mt-16 columns-1 gap-6 md:columns-2 lg:columns-3">
        {QUOTES.map((item) => (
          <li key={item.name} className="mb-6 break-inside-avoid">
            <figure className="flex flex-col-reverse gap-5 rounded-2xl border bg-card p-6 shadow-(--surface-shadow)">
              <blockquote className="text-pretty">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3">
                <PersonAvatar name={item.name} className="size-11" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.role}</span>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}
