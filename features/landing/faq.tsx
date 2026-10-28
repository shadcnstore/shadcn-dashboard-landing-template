import { CircleHelpIcon } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { LANDING_FAQS } from "@/features/faqs/data"

import { Section, SectionHeading } from "./section-heading"

/** Six questions from Chronicle's help centre (features/faqs/data.ts), the same answers the in-app FAQs page gives. */
export function Faq() {
  return (
    <Section id="faq" labelledBy="faq-title">
      <SectionHeading id="faq-title" eyebrow="FAQ" title="Frequently asked questions" lede="What finance and success teams ask before they connect billing. Still curious? We are a message away." />
      <Accordion className="mx-auto mt-16 flex max-w-3xl flex-col gap-3">
        {LANDING_FAQS.map((item) => (
          <AccordionItem key={item.question} value={item.question} className="rounded-xl border bg-card px-5 shadow-(--surface-shadow) not-last:border-b">
            <AccordionTrigger className="items-center gap-3 py-4 text-base hover:no-underline">
              <span className="flex flex-1 items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CircleHelpIcon className="size-4" aria-hidden />
                </span>
                {item.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="ps-10 text-pretty text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground">Still have questions? We are here to help.</p>
        <a href="#contact" className={buttonVariants()}>
          Contact support
        </a>
      </div>
    </Section>
  )
}
