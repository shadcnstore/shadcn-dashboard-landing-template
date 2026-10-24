import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { SectionHeading } from "./section-heading"

const FAQS = [
  {
    question: "Which billing platforms does Tidewell connect to?",
    answer:
      "Tidewell connects read-only to the major subscription billing platforms and payment processors, and imports a CSV for anything else. Most teams are connected in under fifteen minutes.",
  },
  {
    question: "How is MRR calculated?",
    answer:
      "MRR is the normalised monthly value of every active subscription, after discounts and before tax. Annual and quarterly plans are spread evenly, and one-off charges are left out. The full definition is in the app, versioned, so you can see when it changed.",
  },
  {
    question: "Will the numbers match my accounting system?",
    answer:
      "Yes. Every metric reconciles to invoices, credit notes and refunds, and the exports tie back to the totals on screen. When something cannot reconcile, Tidewell flags the invoice instead of guessing.",
  },
  {
    question: "Can I change how churn is defined?",
    answer:
      "On Growth and Scale you can adjust definitions such as grace periods for failed payments or how pauses count. Each change is versioned and shows the before and after on your history.",
  },
  {
    question: "What happens to my data if I leave?",
    answer: "You can export everything as CSV at any time. When you close an account we delete your data within 30 days and confirm it by email.",
  },
  {
    question: "Do you charge per seat?",
    answer: "No. Every plan includes unlimited seats. Pricing follows the revenue you track, so inviting the whole team never costs more.",
  },
]

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
          {FAQS.map((item) => (
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
