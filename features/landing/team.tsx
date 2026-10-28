import { PersonAvatar } from "@/components/chronicle/person-avatar"

import { Section, SectionHeading } from "./section-heading"

/** Chronicle's team. The people are fictional, like the company; their portraits come from lib/avatars.ts. */
const TEAM = [
  { name: "Mei Chen", role: "Co-founder, CEO", bio: "Ran revenue operations at two subscription startups." },
  { name: "Rafael Rodriguez", role: "Co-founder, CTO", bio: "Built billing pipelines that handle a million invoices a day." },
  { name: "Ines Moreau", role: "Head of Product", bio: "Spent a decade turning finance workflows into software." },
  { name: "Kenji Mori", role: "Frontend Lead", bio: "Cares about charts that load fast and read clearly." },
  { name: "Maren Thompson", role: "Data Engineering", bio: "Owns the reconciliation engine and its test suite." },
  { name: "Felix Mitchell", role: "Product Design", bio: "Designs dashboards for people who live in spreadsheets." },
  { name: "Amara Nwosu", role: "Finance Lead", bio: "Writes the metric definitions and keeps us honest." },
  { name: "Lucia Garcia", role: "Customer Success", bio: "Helps every new team reach their first close." },
]

export function Team() {
  return (
    <Section id="team" labelledBy="team-title">
      <SectionHeading id="team-title" eyebrow="Our team" title="Meet the people behind Chronicle" lede="A small team across four time zones. Every one of us takes a support shift each week." />
      <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <li key={member.name} className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-8 text-center shadow-(--surface-shadow)">
            <span className="relative flex size-28 items-center justify-center">
              <span aria-hidden className="absolute inset-0 [background-image:radial-gradient(color-mix(in_oklch,var(--primary)_35%,transparent)_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
              <PersonAvatar name={member.name} className="size-20 shadow-lg ring-4 ring-background" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold tracking-tight">{member.name}</h3>
              <p className="text-sm font-medium text-primary">{member.role}</p>
            </div>
            <p className="text-sm text-pretty text-muted-foreground">{member.bio}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
