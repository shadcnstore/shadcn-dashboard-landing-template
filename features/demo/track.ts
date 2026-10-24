import { trackDemoEvent } from "@/kit/shell/demo-bar"

/** Every demo link back to ShadcnStore fires one GA4 event, named by where it sits. Never a UTM tag. */
export function trackFunnel(placement: string, extra: Record<string, unknown> = {}) {
  trackDemoEvent("demo_bar_click", { template: "chronicle", placement, ...extra })
}
