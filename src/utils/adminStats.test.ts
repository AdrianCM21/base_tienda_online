import { getAllProducts, getProductById } from '@/services/catalogService'
import { computeDashboard } from './adminStats'
import { generateFakeOrders } from './demoOrders'
import { makeProduct as mk } from './testProducts'

const NOW = new Date('2026-10-05T12:00:00Z')

describe('generateFakeOrders', () => {
  const orders = generateFakeOrders(getAllProducts(), NOW)
  it('es determinista y devuelve pedidos válidos ordenados del más reciente al más antiguo', () => {
    expect(generateFakeOrders(getAllProducts(), NOW)).toEqual(orders)
    expect(orders.length).toBeGreaterThanOrEqual(10)
    expect(orders.map((o) => o.createdAt)).toEqual(
      [...orders.map((o) => o.createdAt)].sort().reverse(),
    )
    expect(new Set(orders.map((o) => o.id)).size).toBe(orders.length)
  })
  it('totales coherentes y productos que existen', () => {
    for (const o of orders) {
      expect(o.subtotal).toBe(o.lines.reduce((n, l) => n + l.lineTotal, 0))
      expect(o.total).toBe(o.subtotal + o.shipping)
      for (const l of o.lines) expect(getProductById(l.productId)).toBeDefined()
      expect(new Date(o.createdAt).getTime()).toBeLessThanOrEqual(NOW.getTime())
    }
  })
  it('estados variados según la antigüedad', () => {
    const states = new Set(orders.map((o) => o.status))
    expect(states.size).toBeGreaterThanOrEqual(3)
    expect(
      orders.find((o) => o.status === 'entregado')!.createdAt <
        orders.find((o) => o.status === 'pendiente')!.createdAt,
    ).toBe(true)
  })
  it('sin productos vendibles no hay pedidos', () => {
    expect(generateFakeOrders([mk({ stock: 0 })], NOW)).toEqual([])
  })
})

describe('computeDashboard', () => {
  const products = [
    mk({ id: 'a', name: 'A', stock: 2 }),
    mk({ id: 'b', name: 'B', stock: 50 }),
    mk({ id: 'c', name: 'C', stock: 0 }),
    mk({ id: 'd', name: 'D', stock: 1, status: 'borrador' }),
  ]
  const line = (id: string, q: number, total: number) => ({
    productId: id,
    sku: id,
    name: id.toUpperCase(),
    quantity: q,
    unitPrice: total / q,
    lineTotal: total,
  })
  const order = (date: string, total: number, lines = [line('a', 1, total)]) => ({
    ...generateFakeOrders(getAllProducts(), NOW)[0],
    createdAt: `${date}T10:00:00Z`,
    total,
    lines,
  })

  it('KPIs, serie diaria, top y stock bajo', () => {
    const orders = [
      order('2026-10-05', 1000),
      order('2026-10-05', 3000, [line('b', 3, 3000)]),
      order('2026-10-01', 2000),
      order('2026-08-01', 9999),
    ]
    const s = computeDashboard(orders, products, NOW, 7)
    expect(s).toMatchObject({ sales: 15999, orderCount: 4, averageTicket: 4000, activeProducts: 3 })
    expect(s.daily).toHaveLength(7)
    expect(s.daily.at(-1)).toEqual({ date: '2026-10-05', total: 4000, orders: 2 })
    expect(s.daily.find((d) => d.date === '2026-10-01')).toMatchObject({ total: 2000, orders: 1 })
    expect(s.daily.reduce((n, d) => n + d.total, 0)).toBe(6000) // el pedido de agosto queda fuera de la ventana
    expect(s.topProducts.map((p) => [p.productId, p.units])).toEqual([
      ['a', 3],
      ['b', 3],
    ]) // empatan en unidades: gana el de mayor ingreso
    expect(s.lowStock.map((x) => x.product.id)).toEqual(['c', 'a']) // el borrador no cuenta
  })
  it('sin pedidos: ceros sin dividir por cero', () => {
    expect(computeDashboard([], products, NOW)).toMatchObject({
      sales: 0,
      orderCount: 0,
      averageTicket: 0,
      topProducts: [],
    })
  })
})
