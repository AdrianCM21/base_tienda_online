import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toast-context'

const DURATION_MS = 2800

type Item = { id: number; message: string }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const nextId = useRef(1)

  const toast = useCallback((message: string) => {
    const id = nextId.current++
    setItems((cur) => [...cur.slice(-2), { id, message }])
    window.setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), DURATION_MS)
  }, [])

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
            className="rounded-control bg-dark px-4 py-3 text-[13.5px] font-semibold text-white shadow-card-hover"
          >
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
