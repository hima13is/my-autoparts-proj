"use client"

import { X } from "lucide-react"
import { useEffect, useId, useRef, type ReactNode } from "react"
import { cn } from "../lib/cn"
import { IconButton } from "./IconButton"

export interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Optional line under the title. */
  description?: string
  children: ReactNode
  /** Sticky footer, e.g. the primary action. */
  footer?: ReactNode
  className?: string
}

/**
 * Bottom sheet on phones, centred modal from 768px up. Built on <dialog showModal()>:
 * the rest of the page is inert, Tab stays inside, Esc and the backdrop close it,
 * and focus returns to whatever opened it.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descId = useId()

  // Latest props for the native event listeners, which are registered once.
  const openRef = useRef(open)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    openRef.current = open
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null
      dialog.showModal()
      document.documentElement.style.overflow = "hidden"
    } else if (!open && dialog.open) {
      dialog.close()
      document.documentElement.style.overflow = ""
      returnFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    // Closed by something other than our `open` prop (e.g. a form with method="dialog").
    const handleClose = () => {
      if (!openRef.current) return
      document.documentElement.style.overflow = ""
      returnFocus.current?.focus?.()
      onCloseRef.current()
    }
    // Esc fires "cancel"; let React state drive the close so `open` stays in sync.
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener("close", handleClose)
    dialog.addEventListener("cancel", handleCancel)
    return () => {
      dialog.removeEventListener("close", handleClose)
      dialog.removeEventListener("cancel", handleCancel)
      document.documentElement.style.overflow = ""
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose() // click on the backdrop
      }}
      onKeyDown={(e) => {
        // Handle Esc ourselves (the native "cancel" event can be skipped by browsers).
        if (e.key === "Escape") {
          e.preventDefault()
          onClose()
        }
      }}
      className={cn(
        "m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-white p-0 text-charcoal shadow-sheet",
        "backdrop:bg-charcoal/50",
        "md:m-auto md:max-h-[85vh] md:max-w-lg md:rounded-3xl",
        "open:flex open:flex-col",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-sand px-5 pb-3 pt-4">
        <div
          aria-hidden
          className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-sand md:hidden"
        />
        <div className="pt-2">
          <h2 id={titleId} className="font-heading text-xl font-bold text-ink">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-sm text-graphite">
              {description}
            </p>
          )}
        </div>
        <IconButton label="Close" icon={<X />} onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="border-t border-sand bg-white px-5 py-3">{footer}</div>}
    </dialog>
  )
}
