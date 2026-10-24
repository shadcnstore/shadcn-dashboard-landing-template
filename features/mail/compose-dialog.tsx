"use client"

import { SendIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

import { useMail } from "./store"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** A new message. Sending files it under Sent and confirms with a toast. */
export function ComposeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const send = useMail((state) => state.send)
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const toInvalid = submitted && !EMAIL.test(to.trim())

  const reset = () => {
    setTo("")
    setSubject("")
    setBody("")
    setSubmitted(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>Sent from maya.okafor@example.com.</DialogDescription>
        </DialogHeader>
        <form
          id="compose-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
            if (!EMAIL.test(to.trim())) {
              return
            }
            send({ to: to.trim(), subject: subject.trim(), body })
            toast.add({ type: "success", title: "Message sent", description: `To ${to.trim()}. You will find it under Sent.` })
            onOpenChange(false)
            reset()
          }}
        >
          <FieldGroup className="gap-4">
            <Field data-invalid={toInvalid || undefined}>
              <FieldLabel htmlFor="compose-to">To</FieldLabel>
              <Input id="compose-to" type="email" autoComplete="off" placeholder="name@company.example.com" value={to} onChange={(event) => setTo(event.target.value)} aria-invalid={toInvalid || undefined} autoFocus />
              {toInvalid && <FieldError>Enter an email address, such as ines@kestrelfreight.example.com.</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="compose-subject">Subject</FieldLabel>
              <Input id="compose-subject" placeholder="What is it about?" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="compose-body">Message</FieldLabel>
              <Textarea id="compose-body" className="min-h-36" placeholder="Write your message…" value={body} onChange={(event) => setBody(event.target.value)} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Discard</DialogClose>
          <Button type="submit" form="compose-form">
            Send
            <SendIcon data-icon="inline-end" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
