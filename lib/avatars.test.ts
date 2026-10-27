import { describe, expect, it } from "vitest"

import { accountContact, workspace } from "@/data/generate"
import { TEAM } from "@/data/names"

import { avatarFor, customerAvatarFor } from "./avatars"

const data = workspace()
const teamPortraits = new Set(TEAM.map((member) => avatarFor(member.name)))

describe("sample portraits", () => {
  it("gives every current account a named contact with a photo", () => {
    for (const account of data.accounts.filter((candidate) => candidate.status !== "churned")) {
      const contact = accountContact(account.id)
      expect(contact?.accountId).toBe(account.id)
      expect(contact?.role).toBe("owner")
      expect(customerAvatarFor(contact!.name)).not.toBeNull()
    }
  })

  it("never puts a teammate's face on a customer", () => {
    for (const user of data.users) {
      expect(teamPortraits.has(customerAvatarFor(user.name))).toBe(false)
    }
  })
})
