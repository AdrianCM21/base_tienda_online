import type { Order } from '@/types/order'
import { isSale } from './adminStats'

export type CustomerSegment = 'nuevo' | 'recurrente' | 'vip'

export type Customer = {
  /** Teléfono normalizado (solo dígitos): identifica al cliente. */
  id: string
  name: string
  phone: string
  city: string
  orders: Order[]
  orderCount: number
  totalSpent: number
  averageTicket: number
  lastOrderAt: string
  segment: CustomerSegment
}

/** Gasto a partir del cual un cliente es VIP (o 6+ pedidos). */
export const VIP_SPENT = 60_000_000
export const VIP_ORDERS = 6

export const SEGMENT_LABEL: Record<CustomerSegment, string> = {
  nuevo: 'Nuevo',
  recurrente: 'Recurrente',
  vip: 'VIP',
}

export function segmentOf(orderCount: number, totalSpent: number): CustomerSegment {
  if (totalSpent >= VIP_SPENT || orderCount >= VIP_ORDERS) return 'vip'
  return orderCount >= 2 ? 'recurrente' : 'nuevo'
}

/** Clientes derivados de los pedidos (agrupados por teléfono). Los cancelados no suman al gasto. */
export function buildCustomers(orders: Order[]): Customer[] {
  const groups = new Map<string, Order[]>()
  for (const o of orders) {
    const id = o.shippingData.phone.replace(/\D/g, '')
    groups.set(id, [...(groups.get(id) ?? []), o])
  }
  return [...groups.entries()]
    .map(([id, list]) => {
      const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const paid = sorted.filter(isSale)
      const totalSpent = paid.reduce((n, o) => n + o.total, 0)
      return {
        id,
        name: sorted[0].shippingData.fullName,
        phone: sorted[0].shippingData.phone,
        city: sorted[0].shippingData.city,
        orders: sorted,
        orderCount: sorted.length,
        totalSpent,
        averageTicket: paid.length ? Math.round(totalSpent / paid.length) : 0,
        lastOrderAt: sorted[0].createdAt,
        segment: segmentOf(paid.length, totalSpent),
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
}
