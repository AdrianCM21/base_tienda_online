import { Download, Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import type { Order, OrderStatus } from '@/types/order'
import { buildOrdersCsv } from '@/utils/adminExport'
import { downloadBlob } from '@/utils/download'
import { formatDateTime } from '@/utils/format'
import { normalizeText } from '@/utils/text'
import { ORDER_STATUS, ORDER_STATUSES } from '@/utils/orderFlow'
import { AdminPageHeader } from './AdminPageHeader'
import { OrderDetail } from './OrderDetail'
import { StatusBadge } from './StatusBadge'

const PAYMENT = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
} as const
const PERIODS = [
  { value: '0', label: 'Todo el período' },
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
] as const

const NO_OVERRIDES: Record<string, OrderStatus> = {}

export default function OrdersPage() {
  const { price } = useCurrency()
  const { orders, realIds, now } = useAdminOrders()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  // Un enlace (p. ej. desde "Por hacer") puede abrir la lista ya filtrada: ?estado=pendiente
  const [status, setStatus] = useState<'todos' | OrderStatus>(() => {
    const e = params.get('estado')
    return ORDER_STATUSES.includes(e as OrderStatus) ? (e as OrderStatus) : 'todos'
  })
  const [payment, setPayment] = useState('')
  const [period, setPeriod] = useState('0')
  // Estados y notas editados en pantalla: no se guardan (se pierden al recargar).
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const statusOf = (o: Order): OrderStatus => overrides[o.id] ?? o.status
  const selected = orders.find((o) => o.id === params.get('pedido')) ?? null
  const open = (o: Order | null) => setParams(o ? { pedido: o.id } : {}, { replace: true })

  // Los estados editados solo cambian la lista cuando se filtra por estado; si no, la tabla
  // conserva su página y orden mientras se mueve un pedido por sus estados.
  const filterOverrides = status === 'todos' ? NO_OVERRIDES : overrides
  const filtered = useMemo(() => {
    const nq = normalizeText(q)
    const since = Number(period) ? now.getTime() - Number(period) * 86_400_000 : 0
    return orders.filter(
      (o) =>
        (status === 'todos' || (filterOverrides[o.id] ?? o.status) === status) &&
        (!payment || o.payment.method === payment) &&
        new Date(o.createdAt).getTime() >= since &&
        (!nq || normalizeText(`${o.id} ${o.shippingData.fullName}`).includes(nq)),
    )
  }, [orders, filterOverrides, q, status, payment, period, now])

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: orders.length }
    for (const o of orders)
      c[overrides[o.id] ?? o.status] = (c[overrides[o.id] ?? o.status] ?? 0) + 1
    return c
  }, [orders, overrides])

  const exportCsv = () =>
    downloadBlob(buildOrdersCsv(filtered, statusOf), 'pedidos.csv', 'text/csv;charset=utf-8')

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Pedido',
      sortValue: (o) => o.id,
      cell: (o) => (
        <span className="font-semibold whitespace-nowrap">
          {o.id}
          {realIds.has(o.id) && (
            <span className="ml-2 rounded-[4px] bg-primary px-1.5 py-0.5 text-[10.5px] font-bold text-white">
              TU PEDIDO
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      sortValue: (o) => o.createdAt,
      cell: (o) => (
        <span className="whitespace-nowrap text-muted">{formatDateTime(o.createdAt)}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      sortValue: (o) => o.shippingData.fullName,
      cell: (o) => o.shippingData.fullName,
    },
    {
      key: 'total',
      header: 'Total',
      sortValue: (o) => o.total,
      cell: (o) => <span className="font-semibold whitespace-nowrap">{price(o.total)}</span>,
    },
    {
      key: 'payment',
      header: 'Pago',
      sortValue: (o) => PAYMENT[o.payment.method],
      cell: (o) => <span className="text-muted">{PAYMENT[o.payment.method]}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      sortValue: (o) => ORDER_STATUS[statusOf(o)].label,
      cell: (o) => (
        <StatusBadge tone={ORDER_STATUS[statusOf(o)].tone}>
          {ORDER_STATUS[statusOf(o)].label}
        </StatusBadge>
      ),
    },
    {
      key: 'view',
      header: 'Detalle',
      align: 'right',
      mobileLabel: false,
      cell: (o) => (
        <button
          type="button"
          onClick={() => open(o)}
          aria-label={`Ver pedido ${o.id}`}
          className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark"
        >
          <Eye size={16} aria-hidden="true" />
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Pedidos"
        description="Los pedidos que hagas en el checkout de esta demo aparecen acá, junto a pedidos de ejemplo. Podés mover un pedido por sus estados, pero los cambios no se guardan."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" />
            Exportar CSV
          </Button>
        }
      />

      <div role="group" aria-label="Filtrar por estado" className="mb-4 flex flex-wrap gap-1.5">
        {(['todos', ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => setStatus(s)}
            className={`rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold ${status === s ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
          >
            {s === 'todos' ? 'Todos' : ORDER_STATUS[s].label}{' '}
            <span className="opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Buscar pedidos</span>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por número de pedido o cliente"
            className="w-full rounded-control border border-light bg-white py-2.5 pr-3 pl-9 text-[13.5px]"
          />
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <span className="text-muted">Pago:</span>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="rounded-control border border-light bg-white px-3 py-2.5 font-semibold"
          >
            <option value="">Todos</option>
            {Object.entries(PAYMENT).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <span className="text-muted">Período:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-control border border-light bg-white px-3 py-2.5 font-semibold"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(o) => o.id}
        caption="Pedidos"
        noun="pedidos"
        initialSort={{ key: 'date', dir: 'desc' }}
        onRowClick={open}
        empty={
          <EmptyState icon={<Search size={26} aria-hidden="true" />} title="Ningún pedido coincide">
            Probá con otra búsqueda o cambiá los filtros.
          </EmptyState>
        }
      />

      <Drawer
        open={selected !== null}
        onClose={() => open(null)}
        side="right"
        title={selected ? `Pedido ${selected.id}` : 'Pedido'}
      >
        {selected && (
          <OrderDetail
            order={selected}
            status={statusOf(selected)}
            note={notes[selected.id] ?? ''}
            onStatusChange={(s) => setOverrides((cur) => ({ ...cur, [selected.id]: s }))}
            onNoteChange={(n) => setNotes((cur) => ({ ...cur, [selected.id]: n }))}
          />
        )}
      </Drawer>
    </>
  )
}
