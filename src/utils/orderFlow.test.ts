import { buildOrdersCsv } from './adminExport'
import { generateFakeOrders } from './demoOrders'
import { buildTimeline, ORDER_FLOW, orderSummaryText, whatsappLink } from './orderFlow'
import { getAllProducts } from '@/services/catalogService'

const NOW = new Date('2026-10-05T12:00:00Z')
const orders = generateFakeOrders(getAllProducts(), NOW)
const money = (n: number) => `Gs. ${n}`

describe('orderFlow', () => {
  it('la línea de tiempo llega hasta el estado actual, en orden', () => {
    const o = orders[0]
    const t = buildTimeline(o, 'enviado')
    expect(t.map((e) => e.status)).toEqual(['pendiente', 'confirmado', 'preparando', 'enviado'])
    expect(t.map((e) => e.at)).toEqual([...t.map((e) => e.at)].sort())
    expect(buildTimeline(o, 'pendiente')).toHaveLength(1)
    expect(buildTimeline(o, 'entregado').map((e) => e.status)).toEqual(ORDER_FLOW)
  })
  it('cancelado tiene su propia salida', () => {
    expect(buildTimeline(orders[0], 'cancelado').map((e) => e.status)).toEqual([
      'pendiente',
      'cancelado',
    ])
  })
  it('whatsappLink normaliza teléfonos paraguayos', () => {
    expect(whatsappLink('0981 234 567')).toBe('https://wa.me/595981234567')
    expect(whatsappLink('+595 981 234567', 'Hola María')).toBe(
      'https://wa.me/595981234567?text=Hola%20Mar%C3%ADa',
    )
  })
  it('el resumen incluye cliente, productos y total', () => {
    const txt = orderSummaryText(orders[0], 'confirmado', money)
    expect(txt).toContain(orders[0].id)
    expect(txt).toContain('Confirmado')
    expect(txt).toContain(orders[0].shippingData.fullName)
    expect(txt).toContain(`Total: Gs. ${orders[0].total}`)
  })
})

describe('buildOrdersCsv', () => {
  it('una fila por pedido, con BOM y el estado en texto; respeta estados editados', () => {
    const csv = buildOrdersCsv(orders.slice(0, 3), (o) =>
      o.id === orders[0].id ? 'cancelado' : o.status,
    )
    const lines = csv.split('\r\n')
    expect(csv.startsWith('﻿"Pedido"')).toBe(true)
    expect(lines).toHaveLength(4)
    expect(lines[1]).toContain(orders[0].id)
    expect(lines[1].endsWith('"Cancelado"')).toBe(true)
  })
  it('escapa comillas', () => {
    const o = {
      ...orders[0],
      shippingData: { ...orders[0].shippingData, fullName: 'Ana "la jefa"' },
    }
    expect(buildOrdersCsv([o])).toContain('"Ana ""la jefa"""')
  })
})
