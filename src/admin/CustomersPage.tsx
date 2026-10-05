import { Download, MessageCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { adminPaths } from '@/config/routes'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import { toCsv } from '@/utils/adminExport'
import {
  buildCustomers,
  SEGMENT_LABEL,
  VIP_ORDERS,
  VIP_SPENT,
  type Customer,
  type CustomerSegment,
} from '@/utils/customers'
import { downloadBlob } from '@/utils/download'
import { formatDateTime, formatNumber } from '@/utils/format'
import { ORDER_STATUS, whatsappLink } from '@/utils/orderFlow'
import { normalizeText } from '@/utils/text'
import { AdminPageHeader } from './AdminPageHeader'
import { StatCard } from './StatCard'
import { StatusBadge } from './StatusBadge'
import { Crown, Repeat, UserPlus, Users } from 'lucide-react'

const SEGMENT_TONE = { nuevo: 'gray', recurrente: 'blue', vip: 'green' } as const
const SEGMENTS = ['todos', 'vip', 'recurrente', 'nuevo'] as const
type SegmentFilter = (typeof SEGMENTS)[number]
const SEGMENT_FILTER_LABEL: Record<SegmentFilter, string> = {
  todos: 'Todos',
  vip: 'VIP',
  recurrente: 'Recurrentes',
  nuevo: 'Nuevos',
}

function CustomerDetail({ customer }: { customer: Customer }) {
  const { price } = useCurrency()
  return (
    <div className="p-5 text-[13.5px]">
      <p className="m-0 mb-1 flex items-center gap-2">
        <StatusBadge tone={SEGMENT_TONE[customer.segment]}>
          {SEGMENT_LABEL[customer.segment]}
        </StatusBadge>
        <span className="text-muted">{customer.city}</span>
      </p>
      <p className="m-0 mb-4 text-muted">{customer.phone}</p>
      <dl className="m-0 mb-5 grid grid-cols-3 gap-3 text-center">
        {[
          ['Pedidos', String(customer.orderCount)],
          ['Gastó', price(customer.totalSpent)],
          ['Ticket prom.', price(customer.averageTicket)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-card border border-light px-2 py-2.5">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="m-0 mt-0.5 text-[13px] font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <a
        href={whatsappLink(
          customer.phone,
          `Hola ${customer.name.split(' ')[0]}, ¡gracias por tu compra!`,
        )}
        target="_blank"
        rel="noreferrer"
        className="mb-5 inline-flex items-center gap-1.5 rounded-control border-[1.5px] border-dark px-3 py-[9px] text-[13px] font-semibold text-dark hover:bg-dark hover:text-white"
      >
        <MessageCircle size={15} aria-hidden="true" />
        Escribir por WhatsApp
      </a>
      <h3 className="mb-2 font-sans text-sm font-bold">Historial de pedidos</h3>
      <ul className="m-0 list-none divide-y divide-light p-0">
        {customer.orders.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
            <span>
              <Link to={`${adminPaths.orders}?pedido=${o.id}`} className="font-semibold">
                {o.id}
              </Link>
              <span className="block text-xs text-subtle">{formatDateTime(o.createdAt)}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-semibold">{price(o.total)}</span>
              <StatusBadge tone={ORDER_STATUS[o.status].tone}>
                {ORDER_STATUS[o.status].label}
              </StatusBadge>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CustomersPage() {
  const { price } = useCurrency()
  const { orders } = useAdminOrders()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [segment, setSegment] = useState<SegmentFilter>('todos')

  const customers = useMemo(() => buildCustomers(orders), [orders])
  const selected = customers.find((c) => c.id === params.get('cliente')) ?? null
  const open = (c: Customer | null) => setParams(c ? { cliente: c.id } : {}, { replace: true })

  const counts = useMemo(() => {
    const c: Record<SegmentFilter, number> = {
      todos: customers.length,
      vip: 0,
      recurrente: 0,
      nuevo: 0,
    }
    for (const x of customers) c[x.segment]++
    return c
  }, [customers])
  const filtered = useMemo(() => {
    const nq = normalizeText(q)
    return customers.filter(
      (c) =>
        (segment === 'todos' || c.segment === segment) &&
        (!nq || normalizeText(`${c.name} ${c.phone} ${c.city}`).includes(nq)),
    )
  }, [customers, q, segment])

  const repeatPct = customers.length
    ? Math.round(((counts.recurrente + counts.vip) / customers.length) * 100)
    : 0
  const avgSpent = customers.length
    ? Math.round(customers.reduce((n, c) => n + c.totalSpent, 0) / customers.length)
    : 0

  const exportCsv = () =>
    downloadBlob(
      toCsv([
        [
          'Cliente',
          'Teléfono',
          'Ciudad',
          'Pedidos',
          'Total gastado (Gs.)',
          'Ticket promedio (Gs.)',
          'Último pedido',
          'Segmento',
        ],
        ...filtered.map((c) => [
          c.name,
          c.phone,
          c.city,
          c.orderCount,
          c.totalSpent,
          c.averageTicket,
          c.lastOrderAt,
          SEGMENT_LABEL[c.segment],
        ]),
      ]),
      'clientes.csv',
      'text/csv;charset=utf-8',
    )

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Cliente',
      mobileLabel: false,
      sortValue: (c) => c.name,
      cell: (c) => (
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-light text-xs font-bold text-primary"
          >
            {c.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span>
            <button
              type="button"
              onClick={() => open(c)}
              className="block text-left font-semibold text-text hover:text-primary"
            >
              {c.name}
            </button>
            <span className="block text-xs text-subtle">{c.phone}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'city',
      header: 'Ciudad',
      sortValue: (c) => c.city,
      cell: (c) => <span className="text-muted">{c.city}</span>,
    },
    { key: 'orders', header: 'Pedidos', sortValue: (c) => c.orderCount, cell: (c) => c.orderCount },
    {
      key: 'spent',
      header: 'Total gastado',
      sortValue: (c) => c.totalSpent,
      cell: (c) => <span className="font-semibold whitespace-nowrap">{price(c.totalSpent)}</span>,
    },
    {
      key: 'avg',
      header: 'Ticket promedio',
      sortValue: (c) => c.averageTicket,
      cell: (c) => <span className="whitespace-nowrap">{price(c.averageTicket)}</span>,
    },
    {
      key: 'last',
      header: 'Último pedido',
      sortValue: (c) => c.lastOrderAt,
      cell: (c) => (
        <span className="whitespace-nowrap text-muted">{formatDateTime(c.lastOrderAt)}</span>
      ),
    },
    {
      key: 'segment',
      header: 'Segmento',
      sortValue: (c) => c.segment,
      cell: (c) => (
        <StatusBadge tone={SEGMENT_TONE[c.segment as CustomerSegment]}>
          {SEGMENT_LABEL[c.segment]}
        </StatusBadge>
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Clientes"
        description={`Se arman a partir de los pedidos (agrupados por teléfono). VIP: gastó ${price(VIP_SPENT)} o más, o compró ${VIP_ORDERS} veces o más; recurrente: 2 o más pedidos.`}
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" />
            Exportar CSV
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <StatCard
          label="Clientes"
          value={formatNumber(customers.length)}
          icon={<Users size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Clientes que repiten"
          value={`${repeatPct}%`}
          hint="Compraron 2 veces o más"
          icon={<Repeat size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Gasto promedio"
          value={price(avgSpent)}
          icon={<UserPlus size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Clientes VIP"
          value={formatNumber(counts.vip)}
          icon={<Crown size={16} aria-hidden="true" />}
        />
      </div>

      <div role="group" aria-label="Filtrar por segmento" className="mb-4 flex flex-wrap gap-1.5">
        {SEGMENTS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={segment === s}
            onClick={() => setSegment(s)}
            className={`rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold ${segment === s ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
          >
            {SEGMENT_FILTER_LABEL[s]} <span className="opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>
      <label className="relative mb-4 block max-w-[460px]">
        <span className="sr-only">Buscar clientes</span>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, teléfono o ciudad"
          className="w-full rounded-control border border-light bg-white py-2.5 pr-3 pl-9 text-[13.5px]"
        />
      </label>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(c) => c.id}
        caption="Clientes"
        noun="clientes"
        initialSort={{ key: 'spent', dir: 'desc' }}
        onRowClick={open}
        empty={
          <EmptyState
            icon={<Search size={26} aria-hidden="true" />}
            title="Ningún cliente coincide"
          >
            Probá con otra búsqueda o cambiá el segmento.
          </EmptyState>
        }
      />

      <Drawer
        open={selected !== null}
        onClose={() => open(null)}
        side="right"
        title={selected?.name ?? 'Cliente'}
      >
        {selected && <CustomerDetail customer={selected} />}
      </Drawer>
    </>
  )
}
