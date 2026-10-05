import { CheckCircle2, PackageSearch } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/button-styles'
import { EmptyState } from '@/components/ui/EmptyState'
import { paths } from '@/config/routes'
import { useCurrency } from '@/hooks/useCurrency'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useNoIndex } from '@/hooks/useNoIndex'
import { getBranch } from '@/services/storeService'
import type { Order } from '@/types/order'
import { getOrder } from '@/utils/orders'

function paymentLabel(o: Order, price: (n: number) => string): string {
  const p = o.payment
  if (p.method === 'tarjeta') {
    const base = `Tarjeta terminada en ${p.cardLast4}`
    return p.installments > 1
      ? `${base} · ${p.installments} cuotas de ${price(p.installmentAmount)}`
      : `${base} · 1 pago`
  }
  if (p.method === 'transferencia') return 'Transferencia bancaria (pendiente de acreditación)'
  return `Efectivo en sucursal ${getBranch(p.branchId)?.name ?? ''}`.trim()
}

export default function OrderDone() {
  const { id = '' } = useParams()
  const { price } = useCurrency()
  const order = useMemo(() => getOrder(id), [id])
  useDocumentTitle(order ? 'Pedido confirmado' : 'Pedido no encontrado')
  useNoIndex()

  if (!order) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-16">
        <h1 className="sr-only">Pedido no encontrado</h1>
        <EmptyState
          icon={<PackageSearch size={26} aria-hidden="true" />}
          title="No encontramos ese pedido"
          action={
            <Link to={paths.home} className={buttonClasses('primary')}>
              Volver al inicio
            </Link>
          }
        >
          Los pedidos de la demo se guardan solo en este navegador.
        </EmptyState>
      </div>
    )
  }

  const s = order.shippingData
  const branch = getBranch(s.branchId)
  return (
    <div className="mx-auto max-w-[760px] px-6 pt-10 pb-16">
      <div className="mb-6 text-center">
        <CheckCircle2
          size={56}
          strokeWidth={1.5}
          className="mx-auto mb-3 text-primary"
          aria-hidden="true"
        />
        <h1 className="mb-1.5 text-[28px] font-bold">¡Pedido confirmado!</h1>
        <p className="m-0 text-[14.5px] text-muted">
          Tu número de pedido es <strong className="text-text">{order.id}</strong>
        </p>
      </div>

      <p
        role="note"
        className="mb-6 rounded-card bg-light px-4 py-3 text-center text-[13.5px] font-semibold text-dark"
      >
        Esto es una demostración: no se realizó ningún cobro ni se enviará ningún producto.
      </p>

      <div className="rounded-card border border-light bg-white p-6">
        <h2 className="mb-3 font-sans text-[15px] font-bold">Productos</h2>
        <ul className="m-0 mb-5 list-none divide-y divide-light p-0">
          {order.lines.map((l) => (
            <li
              key={`${l.productId}|${l.colorName ?? ''}`}
              className="flex justify-between gap-4 py-3 text-[13.5px]"
            >
              <span>
                <span className="font-semibold">{l.name}</span>
                <span className="block text-xs text-subtle">
                  Cantidad: {l.quantity}
                  {l.colorName && ` · ${l.colorName}`}
                </span>
              </span>
              <span className="shrink-0 font-bold text-primary">{price(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 border-t border-light pt-3.5 text-[13.5px] text-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{price(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span className={order.shipping === 0 ? 'font-semibold text-primary' : ''}>
              {order.shipping === 0 ? 'Gratis' : price(order.shipping)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-light pt-3 text-text">
            <span className="text-[15px] font-bold">Total</span>
            <span className="text-2xl font-bold text-primary">{price(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 min-[620px]:grid-cols-2">
        <section className="rounded-card border border-light bg-white p-5">
          <h2 className="mb-2 font-sans text-[15px] font-bold">
            {s.method === 'retiro' ? 'Retiro en sucursal' : 'Envío'}
          </h2>
          <p className="m-0 text-[13.5px] leading-relaxed text-muted">
            {s.fullName}
            <br />
            {s.method === 'retiro' && branch ? (
              <>
                {branch.name} — {branch.address}
              </>
            ) : (
              <>
                {s.address}, {s.city}
                <br />
                {s.department} · CP {s.postalCode}
              </>
            )}
            <br />
            Tel. {s.phone}
          </p>
        </section>
        <section className="rounded-card border border-light bg-white p-5">
          <h2 className="mb-2 font-sans text-[15px] font-bold">Pago</h2>
          <p className="m-0 text-[13.5px] leading-relaxed text-muted">
            {paymentLabel(order, price)}
          </p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link to={paths.home} className={buttonClasses('primary', 'lg')}>
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
