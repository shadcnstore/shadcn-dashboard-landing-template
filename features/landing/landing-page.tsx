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
 * Tidewell. A server component: only the navbar, pricing toggle, FAQ and the
 * two forms hydrate.
 */
export function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
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
        <Testimonials />
        <Pricing />
        <Team />
        <Blog />
        <Faq />
        <Contact />
        <div className="pt-20 sm:pt-28">
          <Cta />
        </div>
      </main>
      <Footer />
    </div>
  )
}
