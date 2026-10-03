import type { CartLine } from '@/types/cart'
import type { Order, OrderLine } from '@/types/order'
import { readStorage, writeStorage } from './storage'

export const ORDERS_STORAGE_KEY = 'tienda-demo:orders'

export function toOrderLines(lines: CartLine[]): OrderLine[] {
  return lines.map((l) => ({
    productId: l.product.id,
    sku: l.color?.sku ?? l.product.sku,
    name: l.product.name,
    colorName: l.color?.name,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    lineTotal: l.lineTotal,
  }))
}

/** Número de pedido legible: PED-AAMMDD-XXXX. */
export function createOrderId(now: Date = new Date(), random: () => number = Math.random): string {
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const suffix = Math.floor(random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0')
  return `PED-${yy}${mm}${dd}-${suffix}`
}

export function listOrders(): Order[] {
  const raw = readStorage<unknown>(ORDERS_STORAGE_KEY, [])
  return Array.isArray(raw) ? (raw as Order[]).filter((o) => o && typeof o.id === 'string') : []
}

export const getOrder = (id: string): Order | undefined => listOrders().find((o) => o.id === id)

/** Guarda el pedido (el más reciente primero). */
export function saveOrder(order: Order): void {
  writeStorage(ORDERS_STORAGE_KEY, [order, ...listOrders().filter((o) => o.id !== order.id)])
}
