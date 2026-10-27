import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { avatarFor, customerAvatarFor } from "@/lib/avatars"
import { cn } from "@/lib/utils"

/**
 * A person's portrait, with their initials while it loads or when there is none.
 * Pass `customer` for people at customer accounts, so a customer who shares a
 * teammate's name never gets the teammate's face.
 */
export function PersonAvatar({ name, className, decorative = true, customer = false }: { name: string; className?: string; decorative?: boolean; customer?: boolean }) {
  const src = customer ? customerAvatarFor(name) : avatarFor(name)
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
