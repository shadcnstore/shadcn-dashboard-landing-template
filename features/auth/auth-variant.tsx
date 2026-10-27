"use client"

import { createContext, useContext } from "react"

import { authPath, type AuthScreen, type AuthVariant } from "./auth-paths"

/**
 * The forms are the same in every layout; this context keeps their links
 * inside the layout you are in, so "Create an account" on /sign-in-2 opens
 * /sign-up-2.
 */
const VariantContext = createContext<AuthVariant>(1)

export function AuthVariantProvider({ variant, children }: { variant: AuthVariant; children: React.ReactNode }) {
  return <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>
}

/** The path of an auth screen in the layout the current page uses. */
export function useAuthHref(): (screen: AuthScreen) => string {
  const variant = useContext(VariantContext)
  return (screen) => authPath(screen, variant)
}
