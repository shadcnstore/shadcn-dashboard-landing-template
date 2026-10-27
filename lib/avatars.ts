/**
 * Portrait photos for the sample people, bundled in public/avatars so the
 * template works offline. Every portrait is generated and fictional
 * (product-plan IMAGE-PROMPTS.md); none shows a real person.
 *
 * A person gets the same photo everywhere: their name picks one from the
 * pool that matches their first name, by a stable hash. Names the template
 * does not know (a company, a name you add) get no photo and show initials.
 * Customer accounts show their owner's photo (accountContact in data/generate.ts).
 * Replace this file to use your users' own avatars.
 */

const FEMININE = new Set([
  "Ada", "Amara", "Anika", "Beatriz", "Camille", "Elif", "Esme", "Farah", "Freya", "Hana", "Ines", "Laila", "Lucia", "Maren", "Maya", "Mei", "Mira",
  "Nadia", "Noor", "Priya", "Rhea", "Rosa", "Sanna", "Seren", "Thea", "Uma", "Valentina", "Yara", "Zara", "Lina", "Ana", "Isla", "Chloe", "Lena",
])
const MASCULINE = new Set([
  "Arjun", "Bram", "Chidi", "Diego", "Emeka", "Felix", "Hugo", "Isak", "Jonah", "Kenji", "Leon", "Mateo", "Nikhil", "Olu", "Oskar", "Rafael",
  "Ravi", "Soren", "Tariq", "Tomas", "Yusuf", "Kofi", "Daniel", "Jonas", "Lucas", "Noah", "Samuel", "Ravi",
])
const EITHER = new Set(["Dara", "Kai", "Wen"])

/** Portrait numbers (public/avatars/avatar-NN.webp) by how the person in it presents. Filled in from the generated set. */
const POOLS: Record<"f" | "m", number[]> = {
  f: [2, 4, 5, 7, 9, 11, 14, 16, 17, 19, 22, 24, 25, 27, 29, 31],
  m: [1, 3, 6, 8, 10, 12, 13, 15, 18, 20, 21, 23, 26, 28, 30, 32],
}

/**
 * Named people get a portrait chosen by hand, so no two of them share a face:
 * Tidewell's team (data/names.ts) and the people on the landing page.
 */
const NAMED: Record<string, number> = {
  "Maya Okafor": 7, "Soren Lindqvist": 3, "Priya Iyer": 4, "Diego Marquez": 6, "Hana Sato": 2, "Tariq Haddad": 26, "Freya Dahl": 22, "Emeka Bello": 1,
  "Mei Chen": 19, "Rafael Rodriguez": 23, "Ines Moreau": 9, "Kenji Mori": 8, "Maren Thompson": 5, "Felix Mitchell": 15, "Amara Nwosu": 25, "Lucia Garcia": 31,
  "Priya Raman": 14, "Tomas Lindqvist": 28, "Rosa Osei": 17, "Samuel Alvarez": 20, "Isla Whitfield": 16, "Daniel Brennan": 18,
}

/** Portraits reserved for named people, so a generated customer never wears a teammate's face. */
const RESERVED = new Set(Object.values(NAMED))

function hash(text: string): number {
  let value = 2166136261
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

/** The photo for a sample person, or null when there is none (initials are shown instead). */
export function avatarFor(name: string): string | null {
  const named = NAMED[name.trim()]
  if (named) {
    return path(named)
  }
  return pooled(name)
}

/**
 * The photo for a generated customer. A customer can share a name with
 * someone on the team ("Priya Iyer" at a customer account), so the hand-picked
 * faces are skipped and the name always draws from the unreserved pool.
 */
export function customerAvatarFor(name: string): string | null {
  return pooled(name)
}

function pooled(name: string): string | null {
  const first = name.trim().split(/\s+/)[0] ?? ""
  const pool = (FEMININE.has(first) ? POOLS.f : MASCULINE.has(first) ? POOLS.m : EITHER.has(first) ? [...POOLS.f, ...POOLS.m] : null)?.filter((number) => !RESERVED.has(number))
  if (!pool || pool.length === 0) {
    return null
  }
  return path(pool[hash(name) % pool.length])
}

function path(number: number): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/avatars/avatar-${String(number).padStart(2, "0")}.webp`
}
