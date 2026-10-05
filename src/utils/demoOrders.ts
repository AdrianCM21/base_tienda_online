import type { PaymentMethod } from '@/types/checkout'
import type { Order, OrderStatus } from '@/types/order'
import type { Product } from '@/types/product'
import { shippingCost } from './checkout'
import { installmentAmount } from './format'
import { createOrderId, toOrderLines } from './orders'
import { hydrate } from './cart'

const CUSTOMERS: [string, string][] = [
  ['Lucía Benítez', 'Lambaré'],
  ['Carlos Ramírez', 'Asunción'],
  ['Andrea Martínez', 'San Lorenzo'],
  ['Diego Acosta', 'Luque'],
  ['Natalia Cabrera', 'Encarnación'],
  ['Javier Server', 'Ciudad del Este'],
  ['Camila Peña', 'Fernando de la Mora'],
  ['Roberto Giménez', 'Capiatá'],
]
const METHODS: PaymentMethod[] = ['tarjeta', 'tarjeta', 'transferencia', 'efectivo']

/** Hash determinista pequeño (FNV-1a). */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

function statusFor(ageDays: number): OrderStatus {
  if (ageDays >= 10) return 'entregado'
  if (ageDays >= 4) return 'enviado'
  if (ageDays >= 1) return 'confirmado'
  return 'pendiente'
}

/**
 * Pedidos ficticios y deterministas para el panel admin: repartidos en los últimos 30 días
 * respecto de `now`, con estados coherentes con su antigüedad.
 */
export function generateFakeOrders(products: Product[], now: Date, count = 40): Order[] {
  const sellable = products.filter((p) => p.status === 'activo' && p.stock > 0)
  if (!sellable.length) return []
  const orders: Order[] = []
  for (let i = 0; i < count; i++) {
    const h = hash(`order:${i}`)
    const ageDays = Math.floor((i / count) * 30 + (h % 3))
    const created = new Date(now.getTime() - ageDays * 86_400_000 - (h % 36) * 600_000)
    const items = Array.from({ length: 1 + (h % 3 === 0 ? 2 : h % 2) }, (_, k) => {
      const p = sellable[hash(`item:${i}:${k}`) % sellable.length]
      return {
        productId: p.id,
        colorName: p.colors.find((c) => c.stock > 0)?.name,
        quantity: 1 + (hash(`q:${i}:${k}`) % 2),
      }
    })
    const lines = hydrate(items, (id) => sellable.find((p) => p.id === id))
    if (!lines.length) continue
    const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0)
    const shipping = shippingCost(subtotal, 'domicilio')
    const total = subtotal + shipping
    const [fullName, city] = CUSTOMERS[h % CUSTOMERS.length]
    const method = METHODS[(h >>> 4) % METHODS.length]
    const count12 = Math.min(12, ...lines.map((l) => l.product.installments?.count ?? 1))
    orders.push({
      id: createOrderId(created, () => (hash(`id:${i}`) % 1_000_000) / 1_000_000),
      createdAt: created.toISOString(),
      lines: toOrderLines(lines),
      subtotal,
      shipping,
      total,
      shippingData: {
        fullName,
        phone: `0981 ${200 + (h % 700)} ${100 + ((h >>> 8) % 800)}`,
        method: 'domicilio',
        address: `Calle ${1 + (h % 40)} Nº ${100 + (h % 900)}`,
        city,
        department: 'Central',
        postalCode: String(1200 + (h % 90)),
        branchId: '',
      },
      payment: {
        method,
        cardLast4: method === 'tarjeta' ? String(1000 + (h % 9000)) : undefined,
        installments: method === 'tarjeta' ? count12 : 1,
        installmentAmount:
          method === 'tarjeta' && count12 > 1 ? installmentAmount(total, count12) : total,
        branchId: method === 'efectivo' ? 'asuncion-centro' : undefined,
      },
      status: statusFor(ageDays),
    })
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
