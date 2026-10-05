import type { PaymentMethod, ShippingData } from './checkout'

export type OrderLine = {
  productId: string
  sku: string
  name: string
  colorName?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderStatus =
  'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

export type Order = {
  id: string
  /** ISO 8601 */
  createdAt: string
  lines: OrderLine[]
  subtotal: number
  shipping: number
  total: number
  shippingData: ShippingData
  payment: {
    method: PaymentMethod
    /** Solo los últimos 4 dígitos: nunca se guarda el número completo ni el CVV. */
    cardLast4?: string
    installments: number
    installmentAmount: number
    /** Sucursal donde se paga (solo método "efectivo"). */
    branchId?: string
  }
  status: OrderStatus
}
