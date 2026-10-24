"use client"

import { useState } from "react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

import { ComposeDialog } from "./compose-dialog"
import { MailFolders } from "./mail-folders"
import { MailList } from "./mail-list"
import { MailReader } from "./mail-reader"
import { useMail } from "./store"
import { APP_HEIGHT, useMediaQuery } from "./use-media-query"

/**
 * Mail: folders, list and reader as resizable panes from 1280px, list and
 * reader from 1024px, and one pane at a time below that (the reader has a
 * Back button). All state lives in ./store, so it survives the layout change.
 */
export function MailApp() {
  const wide = useMediaQuery("(min-width: 1280px)")
  const split = useMediaQuery("(min-width: 1024px)")
  const [composing, setComposing] = useState(false)
  // On narrow screens the list comes first; opening a message swaps to the reader.
  const [readerOpen, setReaderOpen] = useState(false)
  const selected = useMail((state) => state.mails.find((mail) => mail.id === state.selectedId) ?? null)
  const compose = () => setComposing(true)

  return (
    <>
      <div className={cn("overflow-hidden rounded-2xl bg-card shadow-(--surface-shadow)", APP_HEIGHT)}>
        {split ? (
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            {wide && (
              <>
                <ResizablePanel id="folders" defaultSize="17%" minSize="200px" maxSize="22%" className="bg-sidebar/40">
                  <MailFolders onCompose={compose} />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            <ResizablePanel id="list" defaultSize={wide ? "33%" : "40%"} minSize="300px">
              <MailList showFolderSelect={!wide} onCompose={compose} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="reader" minSize="30%">
              <MailReader mail={selected} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : readerOpen && selected ? (
          <MailReader mail={selected} onBack={() => setReaderOpen(false)} />
        ) : (
          <MailList showFolderSelect highlightSelected={false} onCompose={compose} onOpen={() => setReaderOpen(true)} />
        )}
      </div>
      <ComposeDialog open={composing} onOpenChange={setComposing} />
    </>
  )
}
