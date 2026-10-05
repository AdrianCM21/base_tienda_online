import {
  Boxes,
  Download,
  CircleCheck,
  FilePenLine,
  PackageX,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
  Truck,
  Wallet,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { adminPaths } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { useActivity } from '@/hooks/useActivity'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import { getAllProductsIncludingDrafts, getCategory } from '@/services/catalogService'
import {
  dailySales,
  LOW_STOCK_LIMIT,
  ordersInRange,
  pendingTasks,
  periodComparison,
  productRanking,
  salesByCategory,
  salesByPayment,
} from '@/utils/adminStats'
import { toCsv } from '@/utils/adminExport'
import { downloadBlob } from '@/utils/download'
import { formatNumber } from '@/utils/format'
import { buildInventoryRows } from '@/utils/inventory'
import { AdminPageHeader } from './AdminPageHeader'
import { BarChart } from './BarChart'
import { DeltaBadge } from './DeltaBadge'
import { PeriodSelect } from './PeriodSelect'
import type { Period } from './periods'
import { ShareBars } from './ShareBars'
import { SetupChecklist } from './SetupChecklist'
import { StatCard } from './StatCard'

const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const PAYMENT = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
} as const

function Task({
  icon,
  label,
  count,
  to,
}: {
  icon: ReactNode
  label: string
  count: number
  to: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-control px-2 py-2.5 text-[13.5px] text-text hover:bg-bg hover:text-text"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-light text-primary'}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">{label}</span>
        <span
          className={`rounded-pill px-2.5 py-0.5 text-xs font-bold ${count > 0 ? 'bg-amber-100 text-amber-900' : 'bg-light text-muted'}`}
        >
          {count}
        </span>
      </Link>
    </li>
  )
}

export default function DashboardPage() {
  const { price } = useCurrency()
  const { orders, now, realIds } = useAdminOrders()
  const { log } = useActivity()
  const [period, setPeriod] = useState<Period>(30)

  const products = useMemo(() => getAllProductsIncludingDrafts(), [])
  const cmp = useMemo(() => periodComparison(orders, now, period), [orders, now, period])
  const inPeriod = useMemo(() => ordersInRange(orders, cmp.range.from, cmp.range.to), [orders, cmp])
  const daily = useMemo(() => dailySales(orders, now, period), [orders, now, period])
  const top = useMemo(() => productRanking(inPeriod).slice(0, 5), [inPeriod])
  const byCategory = useMemo(
    () => salesByCategory(inPeriod, (id) => products.find((p) => p.id === id)?.categoryId),
    [inPeriod, products],
  )
  const byPayment = useMemo(() => salesByPayment(inPeriod), [inPeriod])
  const tasks = useMemo(() => pendingTasks(orders, products), [orders, products])
  const lowStock = useMemo(
    () =>
      buildInventoryRows(products, LOW_STOCK_LIMIT)
        .filter((r) => r.status !== 'ok')
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6),
    [products],
  )
  const nothingPending = Object.values(tasks).every((n) => n === 0)
  const { current, delta } = cmp

  const exportSummary = () => {
    downloadBlob(
      toCsv([
        ['Indicador', 'Valor', 'Variación'],
        ['Ventas', current.sales, `${delta.sales ?? 0}%`],
        ['Pedidos', current.orders, `${delta.orders ?? 0}%`],
        ['Ticket promedio', current.averageTicket, `${delta.averageTicket ?? 0}%`],
        [],
        ['Día', 'Ventas', 'Pedidos'],
        ...daily.map((d) => [d.date, d.total, d.orders]),
      ]),
      `resumen-ultimos-${period}-dias.csv`,
      'text/csv;charset=utf-8',
    )
    log('exportacion', `Exportó el resumen de los últimos ${period} días`)
  }

  return (
    <>
      <AdminPageHeader
        title="Inicio"
        description="Cómo viene tu negocio. Los datos son de ejemplo, más los pedidos que hagas en esta demo."
        actions={
          <>
            <PeriodSelect value={period} onChange={setPeriod} />
            <Button variant="outline" size="sm" onClick={exportSummary}>
              <Download size={16} aria-hidden="true" />
              Exportar resumen
            </Button>
          </>
        }
      />
      <SetupChecklist
        productCount={products.filter((p) => p.status === 'activo').length}
        hasRealOrder={realIds.size > 0}
      />

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        <StatCard
          label="Ventas"
          value={price(current.sales)}
          delta={<DeltaBadge value={delta.sales} />}
          icon={<TrendingUp size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Pedidos"
          value={formatNumber(current.orders)}
          delta={<DeltaBadge value={delta.orders} />}
          icon={<ShoppingBag size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Ticket promedio"
          value={price(current.averageTicket)}
          delta={<DeltaBadge value={delta.averageTicket} />}
          icon={<ReceiptText size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Productos activos"
          value={formatNumber(products.filter((p) => p.status === 'activo').length)}
          hint={`${tasks.drafts} ${tasks.drafts === 1 ? 'borrador' : 'borradores'} sin publicar`}
          icon={<Boxes size={16} aria-hidden="true" />}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 min-[900px]:grid-cols-[1fr_340px]">
        <section
          aria-labelledby="ventas-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2 id="ventas-titulo" className="mb-1 font-sans text-[15px] font-bold">
            Ventas de los últimos {period} días
          </h2>
          <p className="mt-0 mb-3 text-[13px] text-muted">
            {price(current.sales)} en {current.orders} pedidos · {formatNumber(current.units)}{' '}
            unidades. Los pedidos cancelados no se cuentan.
          </p>
          <BarChart
            title={`Ventas de los últimos ${period} días`}
            data={daily.map((d) => ({ label: shortDate(d.date), value: d.total }))}
            format={price}
          />
        </section>

        <section
          aria-labelledby="hacer-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2 id="hacer-titulo" className="mb-2 font-sans text-[15px] font-bold">
            Por hacer
          </h2>
          {nothingPending && (
            <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
              <CircleCheck size={16} aria-hidden="true" />
              Todo al día
            </p>
          )}
          <ul className="m-0 list-none p-0">
            <Task
              icon={<Truck size={16} aria-hidden="true" />}
              label="Pedidos por preparar o enviar"
              count={tasks.toShip}
              to={`${adminPaths.orders}?estado=confirmado`}
            />
            <Task
              icon={<Wallet size={16} aria-hidden="true" />}
              label="Pedidos pendientes de pago"
              count={tasks.awaitingPayment}
              to={`${adminPaths.orders}?estado=pendiente`}
            />
            <Task
              icon={<PackageX size={16} aria-hidden="true" />}
              label="Productos sin stock"
              count={tasks.outOfStock}
              to={`${adminPaths.inventory}?estado=agotado`}
            />
            <Task
              icon={<TriangleAlert size={16} aria-hidden="true" />}
              label="Productos con stock bajo"
              count={tasks.lowStock}
              to={`${adminPaths.inventory}?estado=bajo`}
            />
            <Task
              icon={<FilePenLine size={16} aria-hidden="true" />}
              label="Borradores sin publicar"
              count={tasks.drafts}
              to={`${adminPaths.products}?filtro=borrador`}
            />
          </ul>
        </section>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
        <section
          aria-labelledby="cat-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2 id="cat-titulo" className="mb-3 font-sans text-[15px] font-bold">
            Ventas por categoría
          </h2>
          <ShareBars
            rows={byCategory.slice(0, 6).map((r) => ({
              key: r.key,
              label: getCategory(r.key)?.name ?? r.key,
              value: price(r.revenue),
              share: r.share,
            }))}
          />
        </section>
        <section
          aria-labelledby="pago-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2 id="pago-titulo" className="mb-3 font-sans text-[15px] font-bold">
            Ventas por medio de pago
          </h2>
          <ShareBars
            rows={byPayment.map((r) => ({
              key: r.key,
              label: PAYMENT[r.key as keyof typeof PAYMENT] ?? r.key,
              value: price(r.revenue),
              share: r.share,
              detail: `${r.orders} ${r.orders === 1 ? 'pedido' : 'pedidos'}`,
            }))}
          />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
        <section
          aria-labelledby="top-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2 id="top-titulo" className="mb-3 font-sans text-[15px] font-bold">
            Productos más vendidos
          </h2>
          {top.length === 0 ? (
            <p className="m-0 text-[13.5px] text-muted">Todavía no hay ventas en este período.</p>
          ) : (
            <ol className="m-0 list-none divide-y divide-light p-0">
              {top.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3 py-2.5 text-[13.5px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-light text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                  <span className="shrink-0 text-muted">{p.units} u.</span>
                  <span className="shrink-0 font-bold text-primary">{price(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
          <Link to={adminPaths.reports} className="mt-3 inline-block text-[13px] font-semibold">
            Ver reportes completos →
          </Link>
        </section>

        <section
          aria-labelledby="stock-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2
            id="stock-titulo"
            className="mb-3 flex items-center gap-2 font-sans text-[15px] font-bold"
          >
            <TriangleAlert size={16} className="text-amber-600" aria-hidden="true" />
            Stock bajo
          </h2>
          {lowStock.length === 0 ? (
            <p className="m-0 text-[13.5px] text-muted">Todo el stock está en orden.</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-light p-0">
              {lowStock.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    {r.variant && (
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                        style={{ background: r.variant.hex }}
                      />
                    )}
                    <span className="truncate">
                      {r.name}
                      {r.variant && <span className="text-subtle"> · {r.variant.name}</span>}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-bold ${r.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {r.stock === 0 ? 'Sin stock' : `${r.stock} u.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to={adminPaths.inventory} className="mt-3 inline-block text-[13px] font-semibold">
            Ver inventario →
          </Link>
        </section>
      </div>
    </>
  )
}
