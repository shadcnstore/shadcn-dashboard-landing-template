/**
 * The pressed key in lower case, or "" when the event has none. Browsers fire
 * `keydown` without a `key` for some autofill and IME events, so every
 * shortcut handler reads the key through this instead of `event.key`.
 */
export function pressedKey(event: KeyboardEvent): string {
  return typeof event.key === "string" ? event.key.toLowerCase() : ""
}
