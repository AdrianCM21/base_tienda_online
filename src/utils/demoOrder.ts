import type { CartLine } from '@/types/cart'
import type { Order } from '@/types/order'
import { shippingCost } from './checkout'
import { installmentAmount } from './format'
import { createOrderId, toOrderLines } from './orders'
import { cartSubtotal } from './cart'

/** Pedido de ejemplo para la pantalla de confirmación de la demo (pago con tarjeta de prueba). */
export function buildDemoOrder(
  lines: CartLine[],
  now: Date = new Date(),
  random: () => number = Math.random,
): Order {
  const subtotal = cartSubtotal(lines)
  const shipping = shippingCost(subtotal, 'domicilio')
  const total = subtotal + shipping
  const maxCount = Math.min(3, ...lines.map((l) => l.product.installments?.count ?? 1))
  return {
    id: createOrderId(now, random),
    createdAt: now.toISOString(),
    lines: toOrderLines(lines),
    subtotal,
    shipping,
    total,
    shippingData: {
      fullName: 'María Fernández',
      phone: '0981 234 567',
      method: 'domicilio',
      address: 'Mcal. López 1234',
      city: 'Asunción',
      department: 'Central',
      postalCode: '1209',
      branchId: '',
    },
    payment: {
      method: 'tarjeta',
      cardLast4: '4242',
      installments: maxCount,
      installmentAmount: maxCount > 1 ? installmentAmount(total, maxCount) : total,
    },
    status: 'confirmado',
  }
}
