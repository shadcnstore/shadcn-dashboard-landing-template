/**
 * Chronicle ships each auth screen in three layouts: 1 split with an art
 * panel, 2 a centered card, 3 full-bleed art with a floating card.
 */
export type AuthVariant = 1 | 2 | 3

export type AuthScreen = "sign-in" | "sign-up" | "forgot-password"

/** The path of an auth screen in a layout: /sign-in, /sign-in-2, /sign-in-3. */
export function authPath(screen: AuthScreen, variant: AuthVariant): string {
  return variant === 1 ? `/${screen}` : `/${screen}-${variant}`
}
