import type { PaymentMethod } from '@/types/checkout'
import type { Order, OrderStatus } from '@/types/order'
import type { Product } from '@/types/product'
import { hydrate } from './cart'
import { shippingCost } from './checkout'
import { installmentAmount } from './format'
import { createOrderId, toOrderLines } from './orders'

const FIRST = [
  'María',
  'Lucía',
  'Andrea',
  'Natalia',
  'Camila',
  'Sofía',
  'Carolina',
  'Valeria',
  'Carlos',
  'Diego',
  'Javier',
  'Roberto',
  'Sebastián',
  'Marcos',
  'Luis',
  'Fernando',
  'Gustavo',
  'Daniel',
]
const LAST = [
  'Benítez',
  'Ramírez',
  'Martínez',
  'Acosta',
  'Cabrera',
  'Peña',
  'Giménez',
  'Villalba',
  'Ortiz',
  'Duarte',
  'Ayala',
  'Báez',
  'Rojas',
  'Insfrán',
  'Samaniego',
  'Caballero',
]
const CITIES = [
  'Asunción',
  'Lambaré',
  'San Lorenzo',
  'Luque',
  'Encarnación',
  'Ciudad del Este',
  'Fernando de la Mora',
  'Capiatá',
  'Villa Elisa',
  'Ñemby',
]
const METHODS: PaymentMethod[] = ['tarjeta', 'tarjeta', 'transferencia', 'efectivo']

export type FakeCustomer = { name: string; city: string; phone: string }

/** Hash determinista pequeño (FNV-1a). */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Cartera de clientes de ejemplo (nombre, ciudad y teléfono propios y estables). */
export function fakeCustomers(count = 60): FakeCustomer[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `${FIRST[hash(`first:${i}`) % FIRST.length]} ${LAST[hash(`last:${i}`) % LAST.length]}`,
    city: CITIES[hash(`city:${i}`) % CITIES.length],
    phone: `0971 ${100 + i} ${100 + ((i * 53) % 900)}`,
  }))
}

function statusFor(ageDays: number, h: number): OrderStatus {
  if (ageDays >= 1 && h % 11 === 0) return 'cancelado'
  if (ageDays >= 10) return 'entregado'
  if (ageDays >= 4) return 'enviado'
  if (ageDays >= 2) return 'preparando'
  if (ageDays >= 1) return 'confirmado'
  return 'pendiente'
}

/** Días que abarcan los pedidos de ejemplo (alcanza para comparar 30 días contra los 30 anteriores). */
export const FAKE_ORDER_SPAN_DAYS = 60

/**
 * Pedidos ficticios y deterministas para el panel admin: repartidos en los últimos 60 días
 * respecto de `now`, con estados coherentes con su antigüedad. Los clientes se repiten
 * (algunos compran seguido) para que Clientes y Reportes tengan datos creíbles.
 */
export function generateFakeOrders(products: Product[], now: Date, count = 90): Order[] {
  const sellable = products.filter((p) => p.status === 'activo' && p.stock > 0)
  if (!sellable.length) return []
  const customers = fakeCustomers()
  const orders: Order[] = []
  for (let i = 0; i < count; i++) {
    const h = hash(`order:${i}`)
    const ageDays = Math.floor((i / count) * FAKE_ORDER_SPAN_DAYS + (h % 3))
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
    // Sesgo hacia los primeros clientes: algunos repiten mucho, otros compran una sola vez.
    const u = (hash(`cust:${i}`) % 10_000) / 10_000
    const customer = customers[Math.floor(u ** 1.6 * customers.length)]
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
        fullName: customer.name,
        phone: customer.phone,
        method: 'domicilio',
        address: `Calle ${1 + (h % 40)} Nº ${100 + (h % 900)}`,
        city: customer.city,
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
      status: statusFor(ageDays, h),
    })
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
