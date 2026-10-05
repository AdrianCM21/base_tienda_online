import { Ban, Check, Copy, MessageCircle } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/useToast'
import { getBranch } from '@/services/storeService'
import type { Order, OrderStatus } from '@/types/order'
import { formatDateTime } from '@/utils/format'
import {
  buildTimeline,
  ORDER_FLOW,
  ORDER_STATUS,
  orderSummaryText,
  whatsappLink,
} from '@/utils/orderFlow'
import { StatusBadge } from './StatusBadge'

const PAYMENT = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
} as const

type Props = {
  order: Order
  status: OrderStatus
  note: string
  onStatusChange: (status: OrderStatus) => void
  onNoteChange: (note: string) => void
}

/** Detalle de un pedido con su flujo de estados. Los cambios viven solo en pantalla (demo). */
export function OrderDetail({ order, status, note, onStatusChange, onNoteChange }: Props) {
  const { price } = useCurrency()
  const { toast } = useToast()
  const noteId = useId()
  const s = order.shippingData
  const branch = getBranch(s.branchId)
  const timeline = buildTimeline(order, status)
  const next = ORDER_FLOW[ORDER_FLOW.indexOf(status) + 1]
  const closed = status === 'entregado' || status === 'cancelado'

  const change = (to: OrderStatus) => {
    onStatusChange(to)
    toast(`Estado: ${ORDER_STATUS[to].label} (solo en esta pantalla)`)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderSummaryText(order, status, price))
      toast('Resumen copiado al portapapeles')
    } catch {
      toast('No se pudo copiar el resumen')
    }
  }

  return (
    <div className="p-5 text-[13.5px]">
      <p className="m-0 mb-4 flex flex-wrap items-center gap-2 text-muted">
        {formatDateTime(order.createdAt)}
        <StatusBadge tone={ORDER_STATUS[status].tone}>{ORDER_STATUS[status].label}</StatusBadge>
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {next && !closed && (
          <Button size="sm" onClick={() => change(next)}>
            <Check size={15} aria-hidden="true" />
            Pasar a «{ORDER_STATUS[next].label}»
          </Button>
        )}
        {!closed && (
          <Button size="sm" variant="outline" onClick={() => change('cancelado')}>
            <Ban size={15} aria-hidden="true" />
            Cancelar pedido
          </Button>
        )}
        {closed && (
          <Button size="sm" variant="outline" onClick={() => change('pendiente')}>
            Reabrir pedido
          </Button>
        )}
      </div>

      <h3 className="mb-2 font-sans text-sm font-bold">Seguimiento</h3>
      <ol
        aria-label="Historial del pedido"
        className="m-0 mb-5 list-none border-l-2 border-light p-0 pl-4"
      >
        {timeline.map((e, i) => (
          <li key={e.status} className="relative pb-3 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute top-1 -left-[23px] h-3 w-3 rounded-full border-2 border-white ${e.status === 'cancelado' ? 'bg-red-600' : i === timeline.length - 1 ? 'bg-primary' : 'bg-subtle'}`}
            />
            <span className="font-semibold">{e.label}</span>
            <span className="block text-xs text-subtle">{formatDateTime(e.at)}</span>
          </li>
        ))}
      </ol>

      <h3 className="mb-2 font-sans text-sm font-bold">Productos</h3>
      <ul className="m-0 mb-4 list-none divide-y divide-light p-0">
        {order.lines.map((l) => (
          <li
            key={`${l.productId}|${l.colorName ?? ''}`}
            className="flex justify-between gap-3 py-2"
          >
            <span>
              {l.name}
              <span className="block text-xs text-subtle">
                {l.quantity} × {price(l.unitPrice)}
                {l.colorName && ` · ${l.colorName}`}
              </span>
            </span>
            <span className="shrink-0 font-semibold">{price(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="m-0 mb-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted">
        <dt>Subtotal</dt>
        <dd className="m-0 text-right">{price(order.subtotal)}</dd>
        <dt>Envío</dt>
        <dd className="m-0 text-right">
          {order.shipping === 0 ? 'Gratis' : price(order.shipping)}
        </dd>
        <dt className="font-bold text-text">Total</dt>
        <dd className="m-0 text-right text-base font-bold text-primary">{price(order.total)}</dd>
      </dl>

      <h3 className="mb-1 font-sans text-sm font-bold">Cliente y entrega</h3>
      <p className="m-0 mb-2 leading-relaxed text-muted">
        {s.fullName} · {s.phone}
        <br />
        {s.method === 'retiro' && branch ? `Retiro en ${branch.name}` : `${s.address}, ${s.city}`}
      </p>
      <div className="mb-5 flex flex-wrap gap-2">
        <a
          href={whatsappLink(
            s.phone,
            `Hola ${s.fullName.split(' ')[0]}, te escribimos por tu pedido ${order.id}.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-control border-[1.5px] border-dark px-3 py-[9px] text-[13px] font-semibold text-dark hover:bg-dark hover:text-white"
        >
          <MessageCircle size={15} aria-hidden="true" />
          Escribir por WhatsApp
        </a>
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy size={15} aria-hidden="true" />
          Copiar resumen
        </Button>
      </div>

      <h3 className="mb-1 font-sans text-sm font-bold">Pago</h3>
      <p className="m-0 mb-5 text-muted">
        {PAYMENT[order.payment.method]}
        {order.payment.cardLast4 && ` ····${order.payment.cardLast4}`}
        {order.payment.installments > 1 &&
          ` · ${order.payment.installments} cuotas de ${price(order.payment.installmentAmount)}`}
      </p>

      <label htmlFor={noteId} className="mb-1.5 block text-sm font-bold">
        Nota interna
      </label>
      <textarea
        id={noteId}
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        rows={3}
        placeholder="Solo la ve tu equipo. En la demo no se guarda."
        className="w-full rounded-control border border-light bg-white px-3 py-2.5 text-[13.5px]"
      />
    </div>
  )
}
