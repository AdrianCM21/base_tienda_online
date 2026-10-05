import { Bell } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminPaths } from '@/config/routes'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import { formatDateTime } from '@/utils/format'

/** Campanita de avisos: muestra los pedidos hechos en el checkout de esta demo. */
export function NotificationsBell() {
  const { orders, realIds } = useAdminOrders()
  const { price } = useCurrency()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const fresh = orders.filter((o) => realIds.has(o.id))

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={
          fresh.length
            ? `Avisos: ${fresh.length} ${fresh.length === 1 ? 'pedido nuevo' : 'pedidos nuevos'}`
            : 'Avisos'
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-light hover:text-dark"
      >
        <Bell size={20} aria-hidden="true" />
        {fresh.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
          >
            {fresh.length}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Avisos"
          className="absolute right-0 z-40 mt-2 w-[min(340px,90vw)] rounded-card border border-light bg-white shadow-card-hover"
        >
          <p className="m-0 border-b border-light px-4 py-3 text-[13px] font-bold">Avisos</p>
          {fresh.length === 0 ? (
            <p className="m-0 px-4 py-6 text-center text-[13px] text-muted">
              Sin avisos nuevos. Cuando alguien compre en la tienda de la demo, el pedido aparece
              acá.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-light p-0">
              {fresh.slice(0, 4).map((o) => (
                <li key={o.id}>
                  <Link
                    to={`${adminPaths.orders}?pedido=${o.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[13px] text-text hover:bg-bg hover:text-text"
                  >
                    <strong>Nuevo pedido {o.id}</strong>
                    <span className="block text-muted">
                      {o.shippingData.fullName} · {price(o.total)}
                    </span>
                    <span className="block text-xs text-subtle">{formatDateTime(o.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
