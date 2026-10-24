import { cn } from "@/lib/utils"

/**
 * A rough strength score, 0 to 4: length does most of the work, the way
 * passphrases are meant to. Swap in zxcvbn or your auth provider's check.
 */
export function passwordStrength(password: string, minimum = 12) {
  if (!password) {
    return 0
  }
  let score = password.length >= minimum ? 2 : password.length >= 8 ? 1 : 0
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1
  }
  if (/[\d\W_]/.test(password) || password.includes(" ")) {
    score += 1
  }
  return Math.min(4, score)
}

const LEVELS = [
  { label: "Too short", bar: "bg-destructive" },
  { label: "Weak", bar: "bg-destructive" },
  { label: "Fair", bar: "bg-warning" },
  { label: "Good", bar: "bg-success" },
  { label: "Strong", bar: "bg-success" },
]

/** Four segments that fill and recolour as the password gets stronger, with the word for it. */
export function StrengthMeter({ password, minimum = 12, id, className }: { password: string; minimum?: number; id?: string; className?: string }) {
  const score = passwordStrength(password, minimum)
  return (
    <div id={id} className={cn("flex items-center gap-3", className)} aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-250", password && score >= step ? LEVELS[score].bar : "bg-muted")} />
        ))}
      </div>
      <span className="w-16 text-end text-xs text-muted-foreground">{password ? LEVELS[score].label : "Strength"}</span>
    </div>
  )
}
