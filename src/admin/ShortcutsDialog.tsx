import { useEffect, useId, useRef } from 'react'
import { Switch } from '@/components/ui/Switch'
import { GO_SHORTCUTS } from './shortcuts'

type Props = {
  open: boolean
  onClose: () => void
  enabled: boolean
  onEnabledChange: (v: boolean) => void
}

const Kbd = ({ children }: { children: string }) => (
  <kbd className="inline-block min-w-6 rounded-[4px] border border-light bg-bg px-1.5 py-0.5 text-center font-sans text-[12px] font-semibold text-dark">
    {children}
  </kbd>
)

/** Ayuda de atajos de teclado, con el interruptor para desactivar los de una sola tecla. */
export function ShortcutsDialog({ open, onClose, enabled, onEnabledChange }: Props) {
  return open ? (
    <Dialog onClose={onClose} enabled={enabled} onEnabledChange={onEnabledChange} />
  ) : null
}

function Dialog({ onClose, enabled, onEnabledChange }: Omit<Props, 'open'>) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-card bg-white p-6 shadow-card-hover"
      >
        <h2 id={titleId} className="mb-1 font-sans text-[17px] font-bold">
          Atajos de teclado
        </h2>
        <p className="mt-0 mb-4 text-[13px] text-muted">Para moverte más rápido por el panel.</p>
        <table className="mb-4 w-full border-collapse text-[13.5px]">
          <caption className="sr-only">Lista de atajos</caption>
          <tbody>
            <tr className="border-b border-light">
              <th scope="row" className="py-2 pr-3 text-left font-normal">
                Buscar en todo el panel
              </th>
              <td className="py-2 text-right">
                <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> <span className="text-muted">o</span> <Kbd>/</Kbd>
              </td>
            </tr>
            <tr className="border-b border-light">
              <th scope="row" className="py-2 pr-3 text-left font-normal">
                Mostrar esta ayuda
              </th>
              <td className="py-2 text-right">
                <Kbd>?</Kbd>
              </td>
            </tr>
            {GO_SHORTCUTS.map((s) => (
              <tr key={s.key} className="border-b border-light last:border-0">
                <th scope="row" className="py-2 pr-3 text-left font-normal">
                  Ir a {s.label}
                </th>
                <td className="py-2 text-right">
                  <Kbd>g</Kbd> <span className="text-muted">y luego</span> <Kbd>{s.key}</Kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Switch
          checked={enabled}
          onChange={onEnabledChange}
          label="Atajos de una tecla activados"
          description="Ctrl+K funciona siempre. Desactivá los demás si interfieren con tu lector de pantalla o con tu teclado."
        />
        <div className="mt-4 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-control border-[1.5px] border-dark px-4 py-2 text-[13px] font-semibold text-dark hover:bg-dark hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
