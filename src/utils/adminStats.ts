import type { Order } from '@/types/order'
import type { Product } from '@/types/product'

export type DailySales = { date: string; total: number; orders: number }
export type TopProduct = { productId: string; name: string; units: number; revenue: number }

export type DashboardStats = {
  sales: number
  orderCount: number
  averageTicket: number
  activeProducts: number
  daily: DailySales[]
  topProducts: TopProduct[]
  lowStock: { product: Product; stock: number }[]
}

export const LOW_STOCK_LIMIT = 5

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

/** Métricas del dashboard a partir de pedidos y catálogo; `daily` cubre los últimos `days` días hasta `now`. */
export function computeDashboard(
  orders: Order[],
  products: Product[],
  now: Date,
  days = 14,
): DashboardStats {
  const sales = orders.reduce((n, o) => n + o.total, 0)

  const daily: DailySales[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 86_400_000)
    return { date: dayKey(d), total: 0, orders: 0 }
  })
  const byDate = new Map(daily.map((d) => [d.date, d]))
  for (const o of orders) {
    const slot = byDate.get(o.createdAt.slice(0, 10))
    if (slot) {
      slot.total += o.total
      slot.orders += 1
    }
  }

  const perProduct = new Map<string, TopProduct>()
  for (const o of orders)
    for (const l of o.lines) {
      const cur = perProduct.get(l.productId) ?? {
        productId: l.productId,
        name: l.name,
        units: 0,
        revenue: 0,
      }
      cur.units += l.quantity
      cur.revenue += l.lineTotal
      perProduct.set(l.productId, cur)
    }

  const active = products.filter((p) => p.status === 'activo')
  return {
    sales,
    orderCount: orders.length,
    averageTicket: orders.length ? Math.round(sales / orders.length) : 0,
    activeProducts: active.length,
    daily,
    topProducts: [...perProduct.values()]
      .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
      .slice(0, 5),
    lowStock: active
      .filter((p) => p.stock <= LOW_STOCK_LIMIT)
      .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name, 'es'))
      .slice(0, 6)
      .map((p) => ({ product: p, stock: p.stock })),
  }
}
