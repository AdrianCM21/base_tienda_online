import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  /** Lado desde el que aparece (por defecto izquierda). */
  side?: 'left' | 'right'
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Panel lateral modal (categorías / filtros en móvil): Esc cierra, foco atrapado, scroll bloqueado. */
export function Drawer({ open, onClose, title, side = 'left', children }: Props) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  // Siempre se llama a la versión más reciente de onClose sin reiniciar el efecto: si el padre pasa
  // una función nueva en cada render, reiniciarlo le robaría el foco al campo que se está escribiendo.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCloseRef.current()
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === panelRef.current)
      ) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-dark/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} flex w-[min(360px,92vw)] flex-col bg-white shadow-card-hover outline-none`}
      >
        <div className="flex items-center justify-between border-b border-light px-5 py-3.5">
          <h2 id={titleId} className="m-0 font-sans text-[15px] font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-control p-1 text-muted hover:bg-light"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
