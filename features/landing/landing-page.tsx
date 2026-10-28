import { About } from "./about"
import { Blog } from "./blog"
import { Contact } from "./contact"
import { Cta } from "./cta"
import { Faq } from "./faq"
import { Features } from "./features"
import { Footer } from "./footer"
import { Hero } from "./hero"
import { LogoWall } from "./logo-wall"
import { LandingNavbar } from "./navbar"
import { Pricing } from "./pricing"
import { Stats } from "./stats"
import { Team } from "./team"
import { Testimonials } from "./testimonials"

/**
 * Frontier, the landing page that ships with Chronicle, selling the fictional
 * Tidewell, on v2's layout: monochrome, a dot grid behind a real screenshot
 * of the dashboard, then the full section set. A server component: only the navbar, pricing toggle, FAQ and the
 * two forms hydrate.
 */
export function LandingPage() {
  return (
    <div className="landing-mono min-h-svh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-(--surface-shadow-raised)"
      >
        Skip to content
      </a>
      <LandingNavbar />
      <main id="main">
        <Hero />
        <LogoWall />
        <Stats />
        <About />
        <Features />
        <Team />
        <Pricing />
        <Testimonials />
        <Blog />
        <Faq />
        <Cta />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
