/**
 * The seam between the auth screens and your auth provider.
 *
 * The screens only call these functions. The demo versions below accept any
 * well-formed input after a short wait, so every screen can be tried. To go
 * live, replace each body with your provider's call (Auth.js `signIn`, Clerk,
 * Better Auth, or your own API) and keep the same return shape: resolve on
 * success, throw an Error whose message the screen shows on failure.
 */

export interface AuthResult {
  /** True when the account uses two-step sign-in and must enter a code next. */
  needsCode: boolean
}

/** Demo codes are any six digits except this one, which shows the error state. */
export const DEMO_WRONG_CODE = "000000"

function wait(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const authClient = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    await wait()
    if (password.length < 8) {
      throw new Error("That email and password do not match.")
    }
    return { needsCode: true }
  },

  /** Single sign-on. Redirect to the provider here; the demo signs straight in. */
  async signInWith(provider: "google" | "apple"): Promise<AuthResult> {
    await wait(700)
    void provider
    return { needsCode: false }
  },

  async signUp(input: { name: string; email: string; password: string; workspace: string }): Promise<void> {
    await wait()
    if (input.email.endsWith("@taken.example")) {
      throw new Error("There is already an account with that email. Sign in instead.")
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await wait()
    void email
  },

  async verifyCode(code: string): Promise<void> {
    await wait(400)
    if (code === DEMO_WRONG_CODE) {
      throw new Error("That code is not right, or it has expired. Try the newest one.")
    }
  },

  async resetPassword(code: string, password: string): Promise<void> {
    await wait()
    if (code === DEMO_WRONG_CODE) {
      throw new Error("That code is not right, or it has expired.")
    }
    void password
  },
}
