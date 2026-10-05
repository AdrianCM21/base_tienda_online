import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastOptions } from './toast-context'

const DURATION_MS = 2800
const DURATION_WITH_ACTION_MS = 8000

type Item = { id: number; message: string; action?: ToastOptions['action'] }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((i) => i.id !== id)), [])

  const toast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = nextId.current++
      setItems((cur) => [...cur.slice(-2), { id, message, action: options?.action }])
      window.setTimeout(() => dismiss(id), options?.action ? DURATION_WITH_ACTION_MS : DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      >
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-4 rounded-control bg-dark px-4 py-3 text-[13.5px] font-semibold text-white shadow-card-hover"
          >
            <span>{i.message}</span>
            {i.action && (
              <button
                type="button"
                onClick={() => {
                  i.action!.onClick()
                  dismiss(i.id)
                }}
                className="pointer-events-auto rounded-control px-2 py-1 font-bold text-on-dark-link underline hover:text-white"
              >
                {i.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
