import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { avatarFor } from "@/lib/avatars"
import { cn } from "@/lib/utils"

/** A person's portrait, with their initials while it loads or when there is none. */
export function PersonAvatar({ name, className, decorative = true }: { name: string; className?: string; decorative?: boolean }) {
  const src = avatarFor(name)
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
  return (
    <Avatar className={cn("size-8", className)} aria-hidden={decorative || undefined}>
      {src && <AvatarImage src={src} alt={decorative ? "" : name} loading="lazy" />}
      <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{initials}</AvatarFallback>
    </Avatar>
  )
}
