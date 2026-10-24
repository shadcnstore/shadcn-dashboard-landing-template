"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Account, UserRole } from "@/data/schema"
import { useKitMutation } from "@/kit/data/hooks"
import { currentTime } from "@/lib/clock"
import { adapter } from "@/lib/data"

import { ROLE_LABELS } from "./user-parts"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Invite someone to a customer account. They appear as Invited until they sign in. */
export function InviteDialog({ open, onOpenChange, accounts }: { open: boolean; onOpenChange: (open: boolean) => void; accounts: Account[] }) {
  const choices = accounts.filter((account) => account.status !== "churned").sort((a, b) => a.name.localeCompare(b.name))
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [accountId, setAccountId] = useState("")
  const [role, setRole] = useState<UserRole>("member")
  const [submitted, setSubmitted] = useState(false)

  const invite = useKitMutation(
    () => {
      const account = choices.find((candidate) => candidate.id === (accountId || choices[0]?.id))
      if (!account) {
        return Promise.reject(new Error("The accounts are still loading. Try again in a moment."))
      }
      return adapter.create("users", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: "invited",
        accountId: account.id,
        accountName: account.name,
        plan: account.plan,
        createdAt: currentTime().toISOString(),
        lastSeenAt: null,
      })
    },
    { success: (user) => ({ title: "Invitation sent", description: `${user.email} can join ${user.accountName}.` }), error: "Could not invite", invalidate: ["users"] }
  )

  const nameError = submitted && !name.trim() ? "Enter a name." : undefined
  const emailError = submitted && !EMAIL.test(email.trim()) ? "Enter an email address like ada@example.com." : undefined

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!name.trim() || !EMAIL.test(email.trim())) {
      return
    }
    invite.mutate(undefined, {
      onSuccess: () => {
        setName("")
        setEmail("")
        setAccountId("")
        setRole("member")
        setSubmitted(false)
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Invite a user</DialogTitle>
            <DialogDescription>They get an email with a link to join the account. Invited users do not use a seat until they sign in.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={Boolean(nameError)}>
              <FieldLabel htmlFor="invite-name">Name</FieldLabel>
              <Input id="invite-name" autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} />
              <FieldError>{nameError}</FieldError>
            </Field>
            <Field data-invalid={Boolean(emailError)}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input id="invite-email" type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(emailError)} />
              <FieldError>{emailError}</FieldError>
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <Field>
                <FieldLabel htmlFor="invite-account">Account</FieldLabel>
                <NativeSelect id="invite-account" value={accountId || choices[0]?.id || ""} onChange={(event) => setAccountId(event.target.value)} className="w-full">
                  {choices.map((account) => (
                    <NativeSelectOption key={account.id} value={account.id}>
                      {account.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                <NativeSelect id="invite-role" value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="w-full">
                  {(["admin", "member", "viewer"] as const).map((value) => (
                    <NativeSelectOption key={value} value={value}>
                      {ROLE_LABELS[value]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <FieldDescription>Admins can invite others and change roles. Viewers can only read.</FieldDescription>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending || choices.length === 0}>
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
