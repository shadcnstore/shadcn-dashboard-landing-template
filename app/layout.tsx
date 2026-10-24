import type { Metadata, Viewport } from "next"
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import "./globals.css"
import { AppDataProvider } from "@/components/data-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { THEME } from "@/config/theme"
import { DemoChrome } from "@/features/demo/demo-chrome"
import { CustomizerProvider } from "@/kit/customizer/customizer-provider"
import { CustomizerScript } from "@/kit/customizer/customizer-script"
import { QueryProvider } from "@/kit/data/query-provider"
import { cn } from "@/lib/utils"

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" })

const isDemo = process.env.DEMO_BUILD === "1"

export const metadata: Metadata = {
  title: { default: "Chronicle", template: "%s · Chronicle" },
  description: "Chronicle, a free admin dashboard built with shadcn/ui, Base UI and Next.js.",
  // The public demo must never compete with the template's page on shadcnstore.com.
  robots: isDemo ? { index: false, follow: true } : undefined,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#10141c" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", hanken.variable, mono.variable, "font-sans")}>
      <head>
        <CustomizerScript theme={THEME} />
      </head>
      <body>
        <ThemeProvider defaultTheme="light">
          <NuqsAdapter>
            <QueryProvider>
              <AppDataProvider>
                <CustomizerProvider theme={THEME}>
                  <TooltipProvider>
                    <Toaster>
                      {children}
                      {isDemo && <DemoChrome gtmId={process.env.NEXT_PUBLIC_GTM_ID} />}
                    </Toaster>
                  </TooltipProvider>
                </CustomizerProvider>
              </AppDataProvider>
            </QueryProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
