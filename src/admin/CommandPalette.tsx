import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { getAllProductsIncludingDrafts } from '@/services/catalogService'
import { searchAdmin, type SearchGroup } from '@/utils/adminSearch'
import { buildCustomers } from '@/utils/customers'
import { NAV_SECTIONS } from './navigation'

const GROUPS: SearchGroup[] = ['Secciones', 'Productos', 'Pedidos', 'Clientes']

type Props = { open: boolean; onClose: () => void }

/** Buscador global del panel (Ctrl+K): secciones, productos, pedidos y clientes. */
export function CommandPalette({ open, onClose }: Props) {
  // Se monta solo mientras está abierto: cada apertura empieza con el campo vacío.
  return open ? <Palette onClose={onClose} /> : null
}

function Palette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { orders } = useAdminOrders()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const products = useMemo(() => getAllProductsIncludingDrafts(), [])
  const customers = useMemo(() => buildCustomers(orders), [orders])
  const hits = useMemo(
    () => searchAdmin(query, { sections: NAV_SECTIONS, products, orders, customers }),
    [query, products, orders, customers],
  )
  const current = Math.min(active, Math.max(0, hits.length - 1))

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    return () => previous?.focus()
  }, [])

  const go = (i: number) => {
    const hit = hits[i]
    if (!hit) return
    onClose()
    navigate(hit.to)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(hits.length ? (current + 1) % hits.length : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(hits.length ? (current - 1 + hits.length) % hits.length : 0)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(current)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      e.preventDefault()
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-dark/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscador del panel"
        className="relative w-full max-w-[580px] overflow-hidden rounded-card bg-white shadow-card-hover"
      >
        <div className="flex items-center gap-3 border-b border-light px-4">
          <Search size={18} className="shrink-0 text-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={hits.length ? `${listId}-${current}` : undefined}
            aria-label="Buscar en el panel"
            autoComplete="off"
            placeholder="Buscar productos, pedidos, clientes o secciones…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            className="w-full border-none bg-transparent py-4 text-[15px] outline-none placeholder:text-subtle"
          />
        </div>
        <div
          id={listId}
          role="listbox"
          aria-label="Resultados"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {hits.length === 0 && (
            <p className="m-0 px-3 py-8 text-center text-[13.5px] text-muted">
              Sin resultados para «{query}».
            </p>
          )}
          {GROUPS.map((g) => {
            const items = hits.map((h, i) => ({ h, i })).filter(({ h }) => h.group === g)
            if (!items.length) return null
            return (
              <div key={g} role="group" aria-label={g} className="mb-1">
                <div
                  aria-hidden="true"
                  className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.5px] text-subtle uppercase"
                >
                  {g}
                </div>
                {items.map(({ h, i }) => (
                  <div
                    key={h.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === current}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(i)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2.5 text-[13.5px] ${i === current ? 'bg-light' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{h.title}</span>
                      {h.subtitle && (
                        <span className="block truncate text-xs text-muted">{h.subtitle}</span>
                      )}
                    </span>
                    {i === current && (
                      <CornerDownLeft
                        size={14}
                        className="shrink-0 text-subtle"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        <p className="m-0 border-t border-light bg-bg px-4 py-2 text-xs text-muted">
          ↑ ↓ para moverte · Enter para abrir · Esc para cerrar
        </p>
      </div>
    </div>
  )
}
