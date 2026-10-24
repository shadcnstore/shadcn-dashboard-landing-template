import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Section, SectionHeading } from "./section-heading"

/** Tidewell's team. The people are fictional, like the company. */
const TEAM = [
  { name: "Alexandra Chen", role: "Co-founder, CEO", bio: "Ran revenue operations at two subscription startups." },
  { name: "Marcus Rodriguez", role: "Co-founder, CTO", bio: "Built billing pipelines that handle a million invoices a day." },
  { name: "Sophie Laurent", role: "Head of Product", bio: "Spent a decade turning finance workflows into software." },
  { name: "David Kim", role: "Frontend Lead", bio: "Cares about charts that load fast and read clearly." },
  { name: "Emma Thompson", role: "Data Engineering", bio: "Owns the reconciliation engine and its test suite." },
  { name: "Ryan Mitchell", role: "Product Design", bio: "Designs dashboards for people who live in spreadsheets." },
  { name: "Amara Okafor", role: "Finance Lead", bio: "Writes the metric definitions and keeps us honest." },
  { name: "Isabella Garcia", role: "Customer Success", bio: "Helps every new team reach their first close." },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
}

export function Team() {
  return (
    <Section id="team">
      <SectionHeading eyebrow="Team" title="A small team that answers its own support" lede="Twelve people across four time zones. Every one of us takes a support shift each week." />
      <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <li key={member.name} className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-(--surface-shadow)">
            <Avatar className="size-11">
              <AvatarFallback className="bg-primary/10 font-medium text-primary">{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <h3 className="font-semibold tracking-tight">{member.name}</h3>
              <p className="text-sm text-primary">{member.role}</p>
            </div>
            <p className="text-sm text-pretty text-muted-foreground">{member.bio}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
