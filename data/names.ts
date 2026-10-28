import type { TaskLabel, TeamMember } from "./schema"

/** Word lists for fictional customer names. Two words together, so no name is a real company. */
export const ACCOUNT_PREFIXES = [
  "Alder", "Basalt", "Birchway", "Bluefin", "Cedarline", "Cinder", "Cobble", "Copperleaf", "Driftwood", "Ember",
  "Fernway", "Flintrock", "Foxglove", "Glasshouse", "Halyard", "Harrow", "Heron", "Inlet", "Juniper", "Kestrel",
  "Lanternfish", "Larkspur", "Longmeadow", "Marlow", "Millrace", "Moorland", "Nettle", "Northgate", "Oakum", "Orchard",
  "Pebblebrook", "Pinecrest", "Quarry", "Quillon", "Redwing", "Riverbend", "Rookery", "Saltmarsh", "Sandpiper", "Sedge",
  "Shoreline", "Slate", "Sparrowhawk", "Stillwater", "Tamarack", "Thistle", "Timberline", "Tollgate", "Upland", "Vantage",
  "Wayfarer", "Wexley", "Whitlock", "Willowmere", "Wren", "Yarrow", "Zephyr",
] as const

export const ACCOUNT_SUFFIXES = [
  "Analytics", "Bio", "Capital", "Clinics", "Collective", "Commerce", "Data", "Dental", "Design", "Energy",
  "Foods", "Freight", "Goods", "Health", "Homes", "Insurance", "Labs", "Learning", "Legal", "Logistics",
  "Media", "Mobility", "Outfitters", "Partners", "Payments", "Robotics", "Studio", "Supply", "Systems", "Travel",
] as const

export const INDUSTRIES = ["Logistics", "Healthcare", "Fintech", "Retail", "Education", "Media", "Manufacturing", "Hospitality", "Real estate", "Energy"] as const

export const FIRST_NAMES = [
  "Ada", "Amara", "Anika", "Arjun", "Beatriz", "Bram", "Camille", "Chidi", "Dara", "Diego", "Elif", "Emeka", "Esme", "Farah", "Felix",
  "Freya", "Hana", "Hugo", "Ines", "Isak", "Jonah", "Kai", "Kenji", "Laila", "Leon", "Lucia", "Mateo", "Mei", "Mira", "Nadia",
  "Nikhil", "Noor", "Olu", "Oskar", "Priya", "Rafael", "Ravi", "Rosa", "Sanna", "Seren", "Soren", "Tariq", "Thea", "Tomas", "Uma",
  "Valentina", "Wen", "Yara", "Yusuf", "Zara",
] as const

export const LAST_NAMES = [
  "Abara", "Adeyemi", "Almeida", "Andersen", "Bakshi", "Bello", "Brennan", "Castellano", "Chandra", "Dahl", "Delacroix", "Ekwueme",
  "Farouk", "Fischer", "Garza", "Haddad", "Halvorsen", "Ibarra", "Iyer", "Jansen", "Kamau", "Kowalski", "Lindqvist", "Mahler",
  "Marquez", "Mbeki", "Moreau", "Nakamura", "Novak", "Okafor", "Oyelaran", "Pacheco", "Petrov", "Quintero", "Rahman", "Rossi",
  "Saarinen", "Sato", "Silva", "Takahashi", "Tran", "Varga", "Velasco", "Wada", "Weiss", "Yilmaz", "Zielinski",
] as const

/** Chronicle's own team. Owners of customer accounts and assignees of tasks. */
export const TEAM: TeamMember[] = [
  { id: "tm_maya", name: "Maya Okafor", email: "maya.okafor@example.com", title: "Head of Operations" },
  { id: "tm_soren", name: "Soren Lindqvist", email: "soren.lindqvist@example.com", title: "Engineering Lead" },
  { id: "tm_priya", name: "Priya Iyer", email: "priya.iyer@example.com", title: "Product Designer" },
  { id: "tm_diego", name: "Diego Marquez", email: "diego.marquez@example.com", title: "Customer Success" },
  { id: "tm_hana", name: "Hana Sato", email: "hana.sato@example.com", title: "Account Executive" },
  { id: "tm_tariq", name: "Tariq Haddad", email: "tariq.haddad@example.com", title: "Support Engineer" },
  { id: "tm_freya", name: "Freya Dahl", email: "freya.dahl@example.com", title: "Data Analyst" },
  { id: "tm_emeka", name: "Emeka Bello", email: "emeka.bello@example.com", title: "Frontend Engineer" },
]

/** Chronicle's product backlog. A label here overrides the random one. */
export const TASK_TITLES: [string, TaskLabel | null][] = [
  ["Retry failed card payments after 24 hours", "feature"],
  ["Seat limit banner overlaps the header on mobile", "bug"],
  ["Export cohort table as CSV", "feature"],
  ["Document the webhooks payload for plan changes", "docs"],
  ["Upgrade the charting library to the latest minor", "chore"],
  ["Show MRR movement on the account page", "improvement"],
  ["Invite email lands in spam for some domains", "bug"],
  ["Add a weekly digest email for account owners", "feature"],
  ["Dashboard loads slowly for accounts with 500+ seats", "bug"],
  ["Rename Growth plan limits in the pricing table", null],
  ["Audit log: record role changes", "feature"],
  ["SSO setup guide for Scale customers", "docs"],
  ["Dark mode contrast on chart tooltips", "improvement"],
  ["Remove the unused legacy billing endpoint", "chore"],
  ["Trial reminder three days before it ends", "feature"],
  ["Timezone wrong on the activity feed for some users", "bug"],
  ["Bulk role change for selected users", "feature"],
  ["Explain seat overage on the invoice", "improvement"],
  ["Add keyboard shortcut for the command menu to the docs", "docs"],
  ["Rotate the staging database credentials", "chore"],
  ["Churn survey when an owner cancels", "feature"],
  ["Pagination resets after editing a user", "bug"],
  ["Saved views for the users table", "feature"],
  ["Plan comparison copy review", null],
  ["Retention chart: show partial current month", "improvement"],
  ["Onboarding checklist for new accounts", "feature"],
  ["Search does not match email subdomains", "bug"],
  ["Write the quarterly product update", "docs"],
  ["Move cron jobs to the new scheduler", "chore"],
  ["Expansion revenue forecast on the overview", "feature"],
  ["Calendar invites missing the meeting link", "bug"],
  ["Accessibility pass on the settings forms", "improvement"],
  ["Archive inactive trial accounts after 60 days", "chore"],
  ["Add region filter to the analytics page", "feature"],
  ["Copy edits on the cancellation flow", null],
  ["Usage alerts when an account nears its seat limit", "feature"],
]
