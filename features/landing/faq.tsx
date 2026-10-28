import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LANDING_FAQS } from "@/features/faqs/data"

import { SectionHeading } from "./section-heading"

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-8">
        <div className="flex flex-col gap-6">
          <SectionHeading align="start" eyebrow="FAQ" title="Questions, answered" lede="The things finance and growth teams ask before they connect billing." />
          <p className="text-sm text-muted-foreground">
            Something else?{" "}
            <a href="#contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Send us a note
            </a>
            .
          </p>
        </div>
        <Accordion className="rounded-xl border bg-card px-5 shadow-(--surface-shadow)">
          {LANDING_FAQS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-4 text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-pretty text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
