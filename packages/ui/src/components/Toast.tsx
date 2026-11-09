"use client"

import { CircleAlert, CircleCheck, X } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { cn } from "../lib/cn"

type ToastTone = "success" | "error" | "info"

interface ToastMessage {
  id: number
  tone: ToastTone
  message: string
  /** Optional link or button, e.g. "View cart". */
  action?: ReactNode
}

interface ToastApi {
  show: (
    message: string,
    options?: { tone?: ToastTone; action?: ReactNode; duration?: number }
  ) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

const tones: Record<ToastTone, { box: string; icon: ReactNode }> = {
  success: { box: "bg-ink text-white", icon: <CircleCheck /> },
  error: { box: "bg-brick text-white", icon: <CircleAlert /> },
  info: { box: "bg-charcoal text-white", icon: <CircleAlert /> },
}

/**
 * Short status messages ("Added to cart"). The live region exists from the
 * first render so screen readers announce new messages politely.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id))
  }, [])

  const show = useCallback<ToastApi["show"]>(
    (message, { tone = "success", action, duration = 5000 } = {}) => {
      const id = nextId.current++
      setToasts((all) => [...all.slice(-2), { id, tone, message, action }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "on-dark pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl py-2 pl-4 pr-2 shadow-sheet",
              tones[t.tone].box
            )}
          >
            <span aria-hidden className="[&>svg]:size-5">
              {tones[t.tone].icon}
            </span>
            <p className="flex-1 font-medium">{t.message}</p>
            {t.action}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="grid size-tap shrink-0 place-items-center rounded-full hover:bg-white/10"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
