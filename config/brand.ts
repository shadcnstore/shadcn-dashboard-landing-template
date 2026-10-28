import { ChronicleMark } from "@/components/chronicle/logo"

/**
 * The product's identity, in one place. Every surface (sidebar workspace
 * switcher, landing header and footer, auth pages, error pages) reads the
 * name, mark and tagline from here. To rebrand: change these, swap the mark
 * component and replace app/icon.svg.
 *
 * `credits` is the small "by ShadcnStore" line in the landing footer, the
 * sidebar and the auth pages. Set `show: false` to remove all of them.
 */
export const BRAND = {
  name: "Chronicle",
  tagline: "The admin for your subscription business",
  mark: ChronicleMark,
  credits: {
    show: true,
    by: "ShadcnStore",
    href: "https://shadcnstore.com",
  },
}
