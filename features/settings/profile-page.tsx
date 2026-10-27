"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AtSignIcon,
  CheckSquareIcon,
  IdCardIcon,
  MessageSquareTextIcon,
  UserIcon,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SITE } from "@/config/site"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { initials as initialsOf } from "@/features/tasks/team-avatar"
import { SettingsCard, SettingsHero } from "@/kit/settings/section"
import { SaveBar } from "@/kit/ui-patterns/save-bar"
import { StatusBadge } from "@/kit/ui-patterns/status-badge"
import { cn } from "@/lib/utils"

import { FIT_HERO, SETTINGS_PAGE } from "./fit-hero"
import { useSettingsStore, type Profile } from "./stores"

const BIO_MAX = 200

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(60, "Keep your name under 60 characters."),
  email: z.email("Enter a valid email address."),
  title: z.string().trim().max(60, "Keep your title under 60 characters."),
  bio: z.string().max(BIO_MAX, `Keep your bio under ${BIO_MAX} characters.`),
  initials: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{0,2}$/, "Use one or two letters, or leave it empty."),
})

/** The signed-in user's photo (config/site.ts). Initials typed in the form replace it; clear them to bring the photo back. */
const PHOTO = SITE.user.avatar

function ProfileAvatar({
  profile,
  className,
}: {
  profile: Pick<Profile, "name" | "initials">
  className?: string
}) {
  const letters =
    (profile.initials || initialsOf(profile.name)).toUpperCase() || "?"
  return (
    <Avatar className={cn("size-16 text-lg ring-4 ring-primary/10", className)}>
      {PHOTO && !profile.initials.trim() && <AvatarImage src={PHOTO} alt="" />}
      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 font-semibold text-primary-foreground">
        {letters}
      </AvatarFallback>
    </Avatar>
  )
}

/** How the profile shows up elsewhere: a task assigned to you and a note you left on an account. */
function Preview({ profile }: { profile: Profile }) {
  const first = profile.name.split(" ")[0] || "You"
  return (
    <div className="flex flex-col gap-3" aria-label="Profile preview">
      <span className="text-sm text-muted-foreground">
        How teammates see you
      </span>
      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-(--surface-shadow) ring-1 ring-foreground/5">
        <div className="flex items-start gap-3">
          <ProfileAvatar profile={profile} className="size-9 text-xs ring-2" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="truncate text-sm font-semibold">
                {profile.name || "Your name"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {profile.title || "No title"}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {profile.bio || "No bio yet."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
          <CheckSquareIcon className="size-3.5 text-primary" />
          <span className="truncate">
            <span className="font-mono text-muted-foreground">TW-142</span>{" "}
            assigned to <span className="font-medium">{first}</span>
          </span>
          <span className="ms-auto shrink-0 text-muted-foreground">2h ago</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
          <MessageSquareTextIcon className="size-3.5 text-chart-2" />
          <span className="truncate">
            <span className="font-medium">{first}</span> left a note on Alder
            Commerce
          </span>
          <span className="ms-auto shrink-0 text-muted-foreground">Mon</span>
        </div>
      </div>
    </div>
  )
}

export function ProfileSettingsPage() {
  const saved = useSettingsStore((state) => state.profile)
  const saveProfile = useSettingsStore((state) => state.saveProfile)
  const [saving, setSaving] = useState(false)
  const form = useForm<Profile>({
    resolver: zodResolver(schema),
    defaultValues: saved,
    mode: "onChange",
  })
  const values = useWatch({ control: form.control }) as Profile
  const bioLength = values.bio?.length ?? 0

  const save = form.handleSubmit(async (next) => {
    setSaving(true)
    // Stands in for the request to your backend.
    await new Promise((resolve) => setTimeout(resolve, 450))
    const clean = {
      ...next,
      name: next.name.trim(),
      title: next.title.trim(),
      initials: next.initials.trim().toUpperCase(),
    }
    saveProfile(clean)
    form.reset(clean)
    setSaving(false)
    toast.add({
      type: "success",
      title: "Profile saved",
      description: "Teammates see the new details right away.",
    })
  })

  return (
    <div className={SETTINGS_PAGE}>
      {/* `contents`, so the cards stay direct children of the settings column and keep its spacing. */}
      <form onSubmit={save} noValidate className="contents">
        {/* FIT_HERO: the preview sits beside the profile only when the page itself is 768px wide, so it is never clipped. */}
        <SettingsHero aside={<Preview profile={values} />} className={FIT_HERO}>
          {/* Beside the preview this column is two fifths wide: stack until there is room. */}
          <div className="flex items-center gap-4 @3xl/settings:flex-col @3xl/settings:items-start @6xl/settings:flex-row @6xl/settings:items-center">
            <ProfileAvatar profile={values} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-lg font-semibold">
                {values.name || "Your name"}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {values.email}
              </span>
              <StatusBadge tone="neutral" dot={false} className="mt-1.5 w-fit">
                {values.title || "No title"}
              </StatusBadge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your name, photo and bio appear on tasks you own, notes you
            leave on accounts and in the activity log.
          </p>
        </SettingsHero>

        <SettingsCard
          icon={UserIcon}
          title="Personal details"
          description="Used across Chronicle and in emails to the team."
        >
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                  <Input
                    id="profile-name"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="profile-title">Job title</FieldLabel>
                  <Input
                    id="profile-title"
                    autoComplete="organization-title"
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="initials"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="profile-initials">
                    Initials instead of a photo
                  </FieldLabel>
                  <Input
                    id="profile-initials"
                    maxLength={2}
                    className="font-mono uppercase"
                    placeholder={initialsOf(values.name || "") || "AB"}
                    aria-invalid={fieldState.invalid || undefined}
                    {...field}
                  />
                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      Leave empty to use the first letters of your name.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </SettingsCard>

        <SettingsCard
          icon={IdCardIcon}
          tone="two"
          title="Bio"
          description="A line or two so teammates know what to come to you for."
        >
          <Controller
            control={form.control}
            name="bio"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="profile-bio" className="sr-only">
                  Bio
                </FieldLabel>
                <Textarea
                  id="profile-bio"
                  rows={4}
                  aria-invalid={fieldState.invalid || undefined}
                  {...field}
                />
                <div className="flex items-center justify-between gap-3">
                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription className="flex items-center gap-1.5">
                      <AtSignIcon className="size-3.5" />
                      Mention a teammate with @ in tasks, not here.
                    </FieldDescription>
                  )}
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs tabular-nums",
                      bioLength > BIO_MAX
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {bioLength}/{BIO_MAX}
                  </span>
                </div>
              </Field>
            )}
          />
        </SettingsCard>
      </form>
      <SaveBar
        dirty={form.formState.isDirty}
        saving={saving}
        onSave={() => void save()}
        onDiscard={() => form.reset(saved)}
        saveLabel="Save profile"
      />
    </div>
  )
}
