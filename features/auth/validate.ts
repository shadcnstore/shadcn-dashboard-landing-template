const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_MINIMUM = 8

export function emailError(email: string): string | undefined {
  if (!email.trim()) {
    return "Enter your email address."
  }
  if (!EMAIL.test(email.trim())) {
    return "Enter an email address like you@company.com."
  }
  return undefined
}

export function passwordError(password: string): string | undefined {
  if (!password) {
    return "Enter your password."
  }
  if (password.length < PASSWORD_MINIMUM) {
    return `Use at least ${PASSWORD_MINIMUM} characters.`
  }
  return undefined
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Try again."
}
