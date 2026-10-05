import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  /** Deshabilita el botón de confirmar (p. ej. mientras el formulario no es válido). */
  confirmDisabled?: boolean
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Diálogo modal de confirmación: Esc cancela, el foco empieza en "Cancelar" y queda atrapado. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  confirmDisabled = false,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId()
  const descId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  useEffect(() => {
    onCancelRef.current = onCancel
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCancelRef.current()
      if (e.key !== 'Tab') return
      const first = cancelRef.current
      const last = confirmRef.current
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-[420px] rounded-card bg-white p-6 shadow-card-hover"
      >
        <h2 id={titleId} className="mb-2 font-sans text-[17px] font-bold">
          {title}
        </h2>
        <div id={descId} className="mb-5 text-[14px] text-muted">
          {children}
        </div>
        <div className="flex justify-end gap-2.5">
          <Button ref={cancelRef} variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} size="sm" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
