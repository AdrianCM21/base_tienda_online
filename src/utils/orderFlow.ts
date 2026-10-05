import type { Order, OrderStatus } from '@/types/order'

export type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray'

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  pendiente: { label: 'Pendiente de pago', tone: 'amber' },
  confirmado: { label: 'Confirmado', tone: 'blue' },
  preparando: { label: 'Preparando', tone: 'blue' },
  enviado: { label: 'Enviado', tone: 'blue' },
  entregado: { label: 'Entregado', tone: 'green' },
  cancelado: { label: 'Cancelado', tone: 'red' },
}

/** Camino normal de un pedido (cancelado es una salida aparte). */
export const ORDER_FLOW: OrderStatus[] = [
  'pendiente',
  'confirmado',
  'preparando',
  'enviado',
  'entregado',
]

export const ORDER_STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[]

export type TimelineEvent = { status: OrderStatus; label: string; at: string }

const HOUR = 3_600_000

/**
 * Línea de tiempo de ejemplo: un hito por cada estado ya alcanzado, separados por horas
 * a partir de la creación del pedido (en la demo no se registran los cambios reales).
 */
export function buildTimeline(
  order: Pick<Order, 'createdAt'>,
  status: OrderStatus,
): TimelineEvent[] {
  const start = new Date(order.createdAt).getTime()
  const at = (hours: number) => new Date(start + hours * HOUR).toISOString()
  if (status === 'cancelado') {
    return [
      { status: 'pendiente', label: ORDER_STATUS.pendiente.label, at: at(0) },
      { status: 'cancelado', label: ORDER_STATUS.cancelado.label, at: at(6) },
    ]
  }
  const reached = ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(status) + 1)
  return reached.map((s, i) => ({ status: s, label: ORDER_STATUS[s].label, at: at(i * 9) }))
}

/** Enlace de WhatsApp al cliente (teléfonos paraguayos: 0981… → 595981…). */
export function whatsappLink(phone: string, text = ''): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `595${digits.slice(1)}`
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** Texto plano del pedido, para copiar al portapapeles o enviar por mensaje. */
export function orderSummaryText(
  order: Order,
  status: OrderStatus,
  money: (n: number) => string,
): string {
  const lines = order.lines.map(
    (l) =>
      `• ${l.quantity} × ${l.name}${l.colorName ? ` (${l.colorName})` : ''} — ${money(l.lineTotal)}`,
  )
  return [
    `Pedido ${order.id} — ${ORDER_STATUS[status].label}`,
    `Cliente: ${order.shippingData.fullName} (${order.shippingData.phone})`,
    ...lines,
    `Envío: ${order.shipping === 0 ? 'Gratis' : money(order.shipping)}`,
    `Total: ${money(order.total)}`,
  ].join('\n')
}
