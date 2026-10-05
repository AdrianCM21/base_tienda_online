import type { Order } from '@/types/order'
import type { Product } from '@/types/product'

const DAY = 86_400_000

export type DailySales = { date: string; total: number; orders: number }
export type TopProduct = { productId: string; name: string; units: number; revenue: number }
export type PeriodTotals = { sales: number; orders: number; averageTicket: number; units: number }
export type Delta = { sales: number | null; orders: number | null; averageTicket: number | null }
export type ShareRow = {
  key: string
  revenue: number
  orders: number
  units: number
  share: number
}

export const LOW_STOCK_LIMIT = 5

/** Los pedidos cancelados no cuentan como venta. */
export const isSale = (o: Order): boolean => o.status !== 'cancelado'

const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** Pedidos (no cancelados) con fecha en [from, to). */
export function ordersInRange(orders: Order[], from: number, to: number): Order[] {
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime()
    return isSale(o) && t >= from && t < to
  })
}

function totals(orders: Order[]): PeriodTotals {
  const sales = orders.reduce((n, o) => n + o.total, 0)
  return {
    sales,
    orders: orders.length,
    averageTicket: orders.length ? Math.round(sales / orders.length) : 0,
    units: orders.reduce((n, o) => n + o.lines.reduce((m, l) => m + l.quantity, 0), 0),
  }
}

/** Variación porcentual redondeada; `null` si no hay base de comparación. */
export const pctChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100)

/** Los últimos `days` días contra los `days` anteriores (terminando en `now`). */
export function periodComparison(orders: Order[], now: Date, days: number) {
  const end = now.getTime() + 1
  const start = end - days * DAY
  const current = totals(ordersInRange(orders, start, end))
  const previous = totals(ordersInRange(orders, start - days * DAY, start))
  const delta: Delta = {
    sales: pctChange(current.sales, previous.sales),
    orders: pctChange(current.orders, previous.orders),
    averageTicket: pctChange(current.averageTicket, previous.averageTicket),
  }
  return { current, previous, delta, range: { from: start, to: end } }
}

/** Serie diaria de los últimos `days` días (incluye los días sin ventas). */
export function dailySales(orders: Order[], now: Date, days: number): DailySales[] {
  const daily: DailySales[] = Array.from({ length: days }, (_, i) => ({
    date: dayKey(now.getTime() - (days - 1 - i) * DAY),
    total: 0,
    orders: 0,
  }))
  const byDate = new Map(daily.map((d) => [d.date, d]))
  for (const o of orders.filter(isSale)) {
    const slot = byDate.get(o.createdAt.slice(0, 10))
    if (slot) {
      slot.total += o.total
      slot.orders += 1
    }
  }
  return daily
}

/** Ranking de productos por unidades (desempata por ingresos). */
export function productRanking(orders: Order[]): TopProduct[] {
  const per = new Map<string, TopProduct>()
  for (const o of orders.filter(isSale))
    for (const l of o.lines) {
      const cur = per.get(l.productId) ?? {
        productId: l.productId,
        name: l.name,
        units: 0,
        revenue: 0,
      }
      cur.units += l.quantity
      cur.revenue += l.lineTotal
      per.set(l.productId, cur)
    }
  return [...per.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue)
}

/** Ingresos agrupados por una clave de la línea (categoría) o del pedido (medio de pago). */
function groupRevenue(
  orders: Order[],
  keyOf: (order: Order, line: Order['lines'][number]) => string,
): ShareRow[] {
  const per = new Map<string, { revenue: number; orders: Set<string>; units: number }>()
  for (const o of orders.filter(isSale))
    for (const l of o.lines) {
      const key = keyOf(o, l)
      const cur = per.get(key) ?? { revenue: 0, orders: new Set<string>(), units: 0 }
      cur.revenue += l.lineTotal
      cur.units += l.quantity
      cur.orders.add(o.id)
      per.set(key, cur)
    }
  const total = [...per.values()].reduce((n, v) => n + v.revenue, 0)
  return [...per.entries()]
    .map(([key, v]) => ({
      key,
      revenue: v.revenue,
      orders: v.orders.size,
      units: v.units,
      share: total ? v.revenue / total : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export const salesByCategory = (
  orders: Order[],
  categoryOf: (productId: string) => string | undefined,
): ShareRow[] => groupRevenue(orders, (_o, l) => categoryOf(l.productId) ?? 'Otros')

export const salesByPayment = (orders: Order[]): ShareRow[] =>
  groupRevenue(orders, (o) => o.payment.method)

export type PendingTasks = {
  toShip: number
  awaitingPayment: number
  outOfStock: number
  lowStock: number
  drafts: number
}

/** Cosas para atender hoy: pedidos por enviar o cobrar, stock agotado o bajo, borradores. */
export function pendingTasks(
  orders: Order[],
  products: Product[],
  lowStockLimit = LOW_STOCK_LIMIT,
): PendingTasks {
  const active = products.filter((p) => p.status === 'activo')
  return {
    toShip: orders.filter((o) => o.status === 'confirmado' || o.status === 'preparando').length,
    awaitingPayment: orders.filter((o) => o.status === 'pendiente').length,
    outOfStock: active.filter((p) => p.stock === 0).length,
    lowStock: active.filter((p) => p.stock > 0 && p.stock <= lowStockLimit).length,
    drafts: products.filter((p) => p.status === 'borrador').length,
  }
}
