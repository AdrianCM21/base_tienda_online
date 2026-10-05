import type { Order, OrderStatus } from '@/types/order'
import { ORDER_STATUS } from './orderFlow'

const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

/** CSV genérico (con BOM para que Excel respete los acentos): primera fila = encabezados. */
export function toCsv(rows: (string | number)[][]): string {
  return '\uFEFF' + rows.map((r) => r.map(quote).join(',')).join('\r\n')
}

const PAYMENT = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
} as const

/** CSV de pedidos (con BOM para que Excel respete los acentos). `status` permite reflejar cambios hechos en pantalla. */
export function buildOrdersCsv(
  orders: Order[],
  statusOf: (o: Order) => OrderStatus = (o) => o.status,
): string {
  const header = [
    'Pedido',
    'Fecha',
    'Cliente',
    'Teléfono',
    'Productos',
    'Subtotal',
    'Envío',
    'Total',
    'Pago',
    'Estado',
  ]
  const rows = orders.map((o) => [
    o.id,
    o.createdAt,
    o.shippingData.fullName,
    o.shippingData.phone,
    o.lines.map((l) => `${l.quantity}x ${l.name}`).join(' | '),
    o.subtotal,
    o.shipping,
    o.total,
    PAYMENT[o.payment.method],
    ORDER_STATUS[statusOf(o)].label,
  ])
  return toCsv([header, ...rows])
}
