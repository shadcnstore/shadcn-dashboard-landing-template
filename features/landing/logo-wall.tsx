/**
 * Wordmarks for made-up companies. Each is text plus a small glyph, so none
 * resembles a real brand and the row weighs nothing.
 */
const COMPANIES = [
  { name: "Fernwick", glyph: <circle cx="12" cy="12" r="7" fill="none" strokeWidth="2.5" />, className: "font-semibold tracking-tight" },
  { name: "Saltgrove", glyph: <path d="M4 18 12 5l8 13Z" fill="none" strokeWidth="2.2" strokeLinejoin="round" />, className: "font-medium tracking-wide uppercase text-base" },
  { name: "Quillmark", glyph: <path d="M5 19 19 5M9 5h10v10" fill="none" strokeWidth="2.2" strokeLinecap="round" />, className: "font-semibold italic" },
  { name: "Marrowby", glyph: <rect x="5" y="5" width="14" height="14" rx="3" fill="none" strokeWidth="2.4" />, className: "font-bold tracking-tighter" },
  { name: "Tessellate", glyph: <path d="M4 12h16M12 4v16" fill="none" strokeWidth="2.5" strokeLinecap="round" />, className: "font-medium tracking-tight" },
  { name: "Juniper Row", glyph: <path d="M6 18V6l12 12V6" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />, className: "font-semibold" },
]

export function LogoWall() {
  return (
    <section aria-labelledby="logos-title" className="pt-4 pb-16 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p id="logos-title" className="text-center text-sm text-muted-foreground">
          Finance and customer success teams at subscription companies run on Tidewell
        </p>
        <ul className="mt-10 grid grid-cols-2 items-center gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {COMPANIES.map((company) => (
            <li key={company.name} className="flex items-center justify-center gap-2.5 text-lg text-muted-foreground">
              <svg viewBox="0 0 24 24" aria-hidden className="size-6 stroke-current">
                {company.glyph}
              </svg>
              <span className={company.className}>{company.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
