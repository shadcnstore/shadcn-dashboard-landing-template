"use client"

import dynamic from "next/dynamic"

/** The demo bar and analytics load after the page is interactive: they render nothing on the server anyway, and no page needs them to paint. */
export const DemoChromeLazy = dynamic(() => import("./demo-chrome").then((module) => module.DemoChrome), { ssr: false })
