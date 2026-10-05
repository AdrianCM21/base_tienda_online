import { Download, ReceiptText, ShoppingBag, TrendingUp, Boxes } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Tabs } from '@/components/ui/Tabs'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useCurrency } from '@/hooks/useCurrency'
import { getAllProductsIncludingDrafts, getCategory } from '@/services/catalogService'
import {
  dailySales,
  ordersInRange,
  periodComparison,
  productRanking,
  salesByCategory,
  salesByPayment,
  type DailySales,
  type TopProduct,
} from '@/utils/adminStats'
import { toCsv } from '@/utils/adminExport'
import { downloadBlob } from '@/utils/download'
import { formatNumber } from '@/utils/format'
import { AdminPageHeader } from './AdminPageHeader'
import { BarChart } from './BarChart'
import { DeltaBadge } from './DeltaBadge'
import { PeriodSelect } from './PeriodSelect'
import type { Period } from './periods'
import { ShareBars } from './ShareBars'
import { StatCard } from './StatCard'

const PAYMENT = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
} as const
const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Download size={16} aria-hidden="true" />
      Exportar CSV
    </Button>
  )
}

export default function ReportsPage() {
  const { price } = useCurrency()
  const { orders, now } = useAdminOrders()
  const [period, setPeriod] = useState<Period>(30)

  const products = useMemo(() => getAllProductsIncludingDrafts(), [])
  const cmp = useMemo(() => periodComparison(orders, now, period), [orders, now, period])
  const inPeriod = useMemo(() => ordersInRange(orders, cmp.range.from, cmp.range.to), [orders, cmp])
  const daily = useMemo(() => dailySales(orders, now, period), [orders, now, period])
  const dailyDesc = useMemo(() => [...daily].reverse(), [daily])
  const ranking = useMemo(() => productRanking(inPeriod), [inPeriod])
  const byCategory = useMemo(
    () => salesByCategory(inPeriod, (id) => products.find((p) => p.id === id)?.categoryId),
    [inPeriod, products],
  )
  const byPayment = useMemo(() => salesByPayment(inPeriod), [inPeriod])
  const totalRevenue = ranking.reduce((n, r) => n + r.revenue, 0)
  const { current, delta } = cmp

  const exportCsv = (name: string, rows: (string | number)[][]) =>
    downloadBlob(toCsv(rows), `${name}-ultimos-${period}-dias.csv`, 'text/csv;charset=utf-8')
  const dailyColumns: Column<DailySales>[] = [
    { key: 'date', header: 'Fecha', sortValue: (d) => d.date, cell: (d) => dmy(d.date) },
    { key: 'orders', header: 'Pedidos', sortValue: (d) => d.orders, cell: (d) => d.orders },
    {
      key: 'total',
      header: 'Ventas',
      align: 'right',
      sortValue: (d) => d.total,
      cell: (d) => <span className="font-semibold whitespace-nowrap">{price(d.total)}</span>,
    },
  ]
  const rankColumns: Column<TopProduct>[] = [
    {
      key: 'name',
      header: 'Producto',
      mobileLabel: false,
      sortValue: (r) => r.name,
      cell: (r) => <span className="font-semibold">{r.name}</span>,
    },
    { key: 'units', header: 'Unidades', sortValue: (r) => r.units, cell: (r) => r.units },
    {
      key: 'revenue',
      header: 'Ingresos',
      sortValue: (r) => r.revenue,
      cell: (r) => <span className="font-semibold whitespace-nowrap">{price(r.revenue)}</span>,
    },
    {
      key: 'share',
      header: '% del total',
      sortValue: (r) => r.revenue,
      cell: (r) => `${totalRevenue ? ((r.revenue / totalRevenue) * 100).toFixed(1) : '0.0'}%`,
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Reportes"
        description="Ventas, productos, categorías y medios de pago del período elegido. Los pedidos cancelados no se cuentan."
        actions={<PeriodSelect value={period} onChange={setPeriod} />}
      />

      <Tabs
        tabs={[
          {
            id: 'ventas',
            label: 'Ventas',
            content: (
              <>
                <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
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
                    label="Unidades vendidas"
                    value={formatNumber(current.units)}
                    icon={<Boxes size={16} aria-hidden="true" />}
                  />
                </div>
                <section
                  aria-labelledby="serie-titulo"
                  className="mb-5 rounded-card border border-light bg-white p-5"
                >
                  <h2 id="serie-titulo" className="mb-3 font-sans text-[15px] font-bold">
                    Ventas por día
                  </h2>
                  <BarChart
                    title={`Ventas por día, últimos ${period} días`}
                    data={daily.map((d) => ({
                      label: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
                      value: d.total,
                    }))}
                    format={price}
                  />
                </section>
                <div className="mb-3 flex justify-end">
                  <ExportButton
                    onClick={() =>
                      exportCsv('ventas-por-dia', [
                        ['Fecha', 'Pedidos', 'Ventas (Gs.)'],
                        ...daily.map((d) => [d.date, d.orders, d.total]),
                      ])
                    }
                  />
                </div>
                <DataTable
                  rows={dailyDesc}
                  columns={dailyColumns}
                  getRowId={(d) => d.date}
                  caption="Ventas por día"
                  noun="días"
                />
              </>
            ),
          },
          {
            id: 'productos',
            label: 'Productos',
            content: (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="m-0 text-[13.5px] text-muted">
                    Ranking por unidades vendidas en los últimos {period} días.
                  </p>
                  <ExportButton
                    onClick={() =>
                      exportCsv('ranking-productos', [
                        ['Producto', 'Unidades', 'Ingresos (Gs.)'],
                        ...ranking.map((r) => [r.name, r.units, r.revenue]),
                      ])
                    }
                  />
                </div>
                <DataTable
                  rows={ranking}
                  columns={rankColumns}
                  getRowId={(r) => r.productId}
                  caption="Ranking de productos"
                  noun="productos"
                  empty={<p className="text-[13.5px] text-muted">No hay ventas en este período.</p>}
                />
              </>
            ),
          },
          {
            id: 'categorias',
            label: 'Categorías y pagos',
            content: (
              <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
                <section
                  aria-labelledby="rc-titulo"
                  className="min-w-0 rounded-card border border-light bg-white p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 id="rc-titulo" className="m-0 font-sans text-[15px] font-bold">
                      Ventas por categoría
                    </h2>
                    <ExportButton
                      onClick={() =>
                        exportCsv('ventas-por-categoria', [
                          ['Categoría', 'Ingresos (Gs.)', 'Unidades', 'Participación'],
                          ...byCategory.map((r) => [
                            getCategory(r.key)?.name ?? r.key,
                            r.revenue,
                            r.units,
                            `${Math.round(r.share * 100)}%`,
                          ]),
                        ])
                      }
                    />
                  </div>
                  <ShareBars
                    rows={byCategory.map((r) => ({
                      key: r.key,
                      label: getCategory(r.key)?.name ?? r.key,
                      value: price(r.revenue),
                      share: r.share,
                      detail: `${r.units} unidades`,
                    }))}
                  />
                </section>
                <section
                  aria-labelledby="rp-titulo"
                  className="min-w-0 rounded-card border border-light bg-white p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 id="rp-titulo" className="m-0 font-sans text-[15px] font-bold">
                      Ventas por medio de pago
                    </h2>
                    <ExportButton
                      onClick={() =>
                        exportCsv('ventas-por-medio-de-pago', [
                          ['Medio de pago', 'Ingresos (Gs.)', 'Pedidos', 'Participación'],
                          ...byPayment.map((r) => [
                            PAYMENT[r.key as keyof typeof PAYMENT] ?? r.key,
                            r.revenue,
                            r.orders,
                            `${Math.round(r.share * 100)}%`,
                          ]),
                        ])
                      }
                    />
                  </div>
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
            ),
          },
        ]}
      />
    </>
  )
}
