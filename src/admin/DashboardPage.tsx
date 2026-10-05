import { Link } from 'react-router-dom'
import { Boxes, ReceiptText, ShoppingBag, TrendingUp, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { adminPaths } from '@/config/routes'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import { getAllProductsIncludingDrafts } from '@/services/catalogService'
import { computeDashboard } from '@/utils/adminStats'
import { formatNumber } from '@/utils/format'
import { AdminPageHeader } from './AdminPageHeader'
import { BarChart } from './BarChart'
import { StatCard } from './StatCard'

const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

export default function DashboardPage() {
  const { price } = useCurrency()
  const { orders, now } = useAdminOrders()
  const stats = useMemo(
    () => computeDashboard(orders, getAllProductsIncludingDrafts(), now),
    [orders, now],
  )

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Resumen de la tienda. Los datos son de ejemplo, más los pedidos que hagas en esta demo."
      />

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        <StatCard
          label="Ventas"
          value={price(stats.sales)}
          hint="Últimos 30 días"
          icon={<TrendingUp size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Pedidos"
          value={formatNumber(stats.orderCount)}
          hint="Últimos 30 días"
          icon={<ShoppingBag size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Ticket promedio"
          value={price(stats.averageTicket)}
          icon={<ReceiptText size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Productos activos"
          value={formatNumber(stats.activeProducts)}
          icon={<Boxes size={16} aria-hidden="true" />}
        />
      </div>

      <section
        aria-labelledby="ventas-titulo"
        className="mb-6 rounded-card border border-light bg-white p-5"
      >
        <h2 id="ventas-titulo" className="mb-3 font-sans text-[15px] font-bold">
          Ventas de los últimos 14 días
        </h2>
        <BarChart
          title="Ventas de los últimos 14 días"
          data={stats.daily.map((d) => ({ label: shortDate(d.date), value: d.total }))}
          format={price}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
        <section
          aria-labelledby="top-titulo"
          className="min-w-0 rounded-card border border-light bg-white p-5"
        >
          <h2 id="top-titulo" className="mb-3 font-sans text-[15px] font-bold">
            Productos más vendidos
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="m-0 text-[13.5px] text-muted">Todavía no hay ventas.</p>
          ) : (
            <ol className="m-0 list-none divide-y divide-light p-0">
              {stats.topProducts.map((p, i) => (
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
          {stats.lowStock.length === 0 ? (
            <p className="m-0 text-[13.5px] text-muted">Todo el stock está en orden.</p>
          ) : (
            <ul className="m-0 list-none divide-y divide-light p-0">
              {stats.lowStock.map(({ product, stock }) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]"
                >
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  <span
                    className={`shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-bold ${stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {stock === 0 ? 'Sin stock' : `${stock} u.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to={adminPaths.products} className="mt-3 inline-block text-[13px] font-semibold">
            Ver todos los productos →
          </Link>
        </section>
      </div>
    </>
  )
}
