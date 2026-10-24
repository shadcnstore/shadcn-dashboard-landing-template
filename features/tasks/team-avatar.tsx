import { UserRoundIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TEAM } from "@/data/names"
import type { TeamMember } from "@/data/schema"
import { cn } from "@/lib/utils"

export const TEAM_BY_ID = new Map(TEAM.map((member) => [member.id, member]))

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** Each teammate keeps one tint everywhere, picked from their id. */
const TINTS = [
  "bg-chart-lead/15 text-primary",
  "bg-chart-2/20 text-foreground",
  "bg-chart-3/25 text-foreground",
  "bg-success/15 text-success",
  "bg-info/15 text-info",
  "bg-warning/20 text-foreground",
]

function tint(id: string): string {
  let hash = 0
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997
  }
  return TINTS[hash % TINTS.length]
}

/** A teammate as an initials avatar, or a dashed ring when nobody is assigned. */
export function TeamAvatar({
  member,
  size = "sm",
  tooltip = true,
  className,
}: {
  member: TeamMember | null | undefined
  size?: "sm" | "default"
  tooltip?: boolean
  className?: string
}) {
  const avatar = (
    <Avatar
      size={size}
      className={cn(
        !member &&
          "border border-dashed border-muted-foreground/40 bg-transparent after:hidden",
        !tooltip && className
      )}
    >
      <AvatarFallback
        className={cn(
          "text-[10px] font-semibold",
          member ? tint(member.id) : "bg-transparent text-muted-foreground"
        )}
      >
        {member ? initials(member.name) : <UserRoundIcon className="size-3" />}
      </AvatarFallback>
    </Avatar>
  )
  if (!tooltip) {
    return avatar
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn("inline-flex", className)} />}
      >
        {avatar}
      </TooltipTrigger>
      <TooltipContent>
        {member ? `${member.name} · ${member.title}` : "Unassigned"}
      </TooltipContent>
    </Tooltip>
  )
}
