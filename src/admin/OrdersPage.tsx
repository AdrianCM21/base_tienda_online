import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Pagination } from '@/components/ui/Pagination'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import { getBranch } from '@/services/storeService'
import type { Order, OrderStatus } from '@/types/order'
import { formatDateTime } from '@/utils/format'
import { paginate } from '@/utils/paginate'
import { AdminPageHeader } from './AdminPageHeader'
import { StatusBadge, type Tone } from './StatusBadge'

const PAGE_SIZE = 10
const STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  pendiente: { label: 'Pendiente', tone: 'amber' },
  confirmado: { label: 'Confirmado', tone: 'blue' },
  enviado: { label: 'Enviado', tone: 'blue' },
  entregado: { label: 'Entregado', tone: 'green' },
}
const PAYMENT = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
} as const

function OrderDetail({ order }: { order: Order }) {
  const { price } = useCurrency()
  const s = order.shippingData
  const branch = getBranch(s.branchId)
  return (
    <div className="p-5 text-[13.5px]">
      <p className="m-0 mb-4 text-muted">
        {formatDateTime(order.createdAt)} ·{' '}
        <StatusBadge tone={STATUS[order.status].tone}>{STATUS[order.status].label}</StatusBadge>
      </p>
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
      <dl className="m-0 mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted">
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
      <p className="m-0 mb-4 leading-relaxed text-muted">
        {s.fullName} · {s.phone}
        <br />
        {s.method === 'retiro' && branch ? `Retiro en ${branch.name}` : `${s.address}, ${s.city}`}
      </p>
      <h3 className="mb-1 font-sans text-sm font-bold">Pago</h3>
      <p className="m-0 text-muted">
        {PAYMENT[order.payment.method]}
        {order.payment.cardLast4 && ` ····${order.payment.cardLast4}`}
        {order.payment.installments > 1 &&
          ` · ${order.payment.installments} cuotas de ${price(order.payment.installmentAmount)}`}
      </p>
    </div>
  )
}

export default function OrdersPage() {
  const { price } = useCurrency()
  const { orders, realIds } = useAdminOrders()
  const [status, setStatus] = useState<'todos' | OrderStatus>('todos')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Order | null>(null)

  const filtered = useMemo(
    () => orders.filter((o) => status === 'todos' || o.status === status),
    [orders, status],
  )
  const view = paginate(filtered, page, PAGE_SIZE)

  return (
    <>
      <AdminPageHeader
        title="Pedidos"
        description={`Los pedidos que hagas en el checkout de esta demo aparecen acá, junto a pedidos de ejemplo.`}
      />

      <div className="mb-4 flex items-center gap-2 text-[13.5px]">
        <label htmlFor="estado-pedido" className="text-muted">
          Estado:
        </label>
        <select
          id="estado-pedido"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status)
            setPage(1)
          }}
          className="rounded-control border border-light bg-white px-3 py-2 font-semibold"
        >
          <option value="todos">Todos</option>
          {(Object.keys(STATUS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-card border border-light bg-white">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-light text-left text-xs text-muted">
              {['Pedido', 'Fecha', 'Cliente', 'Total', 'Pago', 'Estado'].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {view.items.map((o) => (
              <tr key={o.id} className="border-b border-light last:border-0">
                <td className="px-4 py-2.5 font-semibold whitespace-nowrap">
                  {o.id}
                  {realIds.has(o.id) && (
                    <span className="ml-2 rounded-[4px] bg-primary px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                      TU PEDIDO
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="px-4 py-2.5">{o.shippingData.fullName}</td>
                <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{price(o.total)}</td>
                <td className="px-4 py-2.5 text-muted">{PAYMENT[o.payment.method]}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</StatusBadge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(o)}
                    aria-label={`Ver pedido ${o.id}`}
                    className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark"
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={view.page} pageCount={view.pageCount} onPageChange={setPage} />

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        side="right"
        title={selected ? `Pedido ${selected.id}` : 'Pedido'}
      >
        {selected && <OrderDetail order={selected} />}
      </Drawer>
    </>
  )
}
