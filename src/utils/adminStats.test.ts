import {
  getAllProducts,
  getAllProductsIncludingDrafts,
  getProductById,
} from '@/services/catalogService'
import type { Order, OrderStatus } from '@/types/order'
import {
  dailySales,
  ordersInRange,
  pctChange,
  pendingTasks,
  periodComparison,
  productRanking,
  salesByCategory,
  salesByPayment,
} from './adminStats'
import { buildCustomers, segmentOf } from './customers'
import { fakeCustomers, generateFakeOrders } from './demoOrders'
import { buildInventoryRows, stockStatus, summarizeInventory } from './inventory'
import { makeProduct as mk } from './testProducts'

const NOW = new Date('2026-10-05T12:00:00Z')
const orders = generateFakeOrders(getAllProducts(), NOW)

describe('generateFakeOrders', () => {
  it('es determinista y devuelve pedidos válidos ordenados del más reciente al más antiguo', () => {
    expect(generateFakeOrders(getAllProducts(), NOW)).toEqual(orders)
    expect(orders.length).toBeGreaterThanOrEqual(80)
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
  it('abarca 60 días y tiene estados variados según la antigüedad', () => {
    const oldest = new Date(orders.at(-1)!.createdAt).getTime()
    expect((NOW.getTime() - oldest) / 86_400_000).toBeGreaterThan(50)
    const states = new Set(orders.map((o) => o.status))
    for (const s of [
      'pendiente',
      'confirmado',
      'preparando',
      'enviado',
      'entregado',
      'cancelado',
    ] as OrderStatus[])
      expect(states.has(s), s).toBe(true)
  })
  it('la cartera tiene una mezcla creíble de segmentos (no todos VIP)', () => {
    const customers = buildCustomers(orders)
    const share = (seg: string) =>
      customers.filter((c) => c.segment === seg).length / customers.length
    expect(share('vip')).toBeLessThan(0.35)
    expect(share('vip')).toBeGreaterThan(0)
    expect(share('recurrente')).toBeGreaterThan(0.15)
    expect(share('nuevo')).toBeGreaterThan(0.2)
  })
  it('hay clientes que repiten y otros que compran una sola vez', () => {
    const counts = [...buildCustomers(orders)].map((c) => c.orderCount)
    expect(counts.length).toBeGreaterThan(25)
    expect(Math.max(...counts)).toBeGreaterThanOrEqual(4)
    expect(counts.some((n) => n === 1)).toBe(true)
  })
  it('sin productos vendibles no hay pedidos', () => {
    expect(generateFakeOrders([mk({ stock: 0 })], NOW)).toEqual([])
  })
  it('la cartera de clientes tiene teléfonos únicos', () => {
    const c = fakeCustomers()
    expect(new Set(c.map((x) => x.phone)).size).toBe(c.length)
  })
})

const base = orders[0]
const order = (date: string, total: number, over: Partial<Order> = {}): Order => ({
  ...base,
  id: `T-${date}-${total}`,
  createdAt: `${date}T10:00:00Z`,
  total,
  status: 'confirmado',
  payment: { ...base.payment, method: 'tarjeta' },
  lines: [{ productId: 'a', sku: 'a', name: 'A', quantity: 1, unitPrice: total, lineTotal: total }],
  ...over,
})

describe('periodComparison', () => {
  const list = [
    order('2026-10-05', 1000),
    order('2026-10-04', 3000),
    order('2026-10-01', 2000),
    order('2026-09-30', 1500),
    order('2026-09-25', 500),
    order('2026-10-03', 9999, { status: 'cancelado' }),
  ]
  it('compara los últimos N días contra los N anteriores y excluye cancelados', () => {
    const { current, previous, delta } = periodComparison(list, NOW, 5)
    // actual: 1-5 oct → 1000 + 3000 + 2000 ; anterior: 26-30 sep → 1500
    expect(current).toMatchObject({ sales: 6000, orders: 3, averageTicket: 2000 })
    expect(previous).toMatchObject({ sales: 1500, orders: 1 })
    expect(delta).toEqual({ sales: 300, orders: 200, averageTicket: 33 })
  })
  it('sin período anterior la variación es null', () => {
    expect(periodComparison([order('2026-10-05', 100)], NOW, 7).delta.sales).toBeNull()
    expect(pctChange(10, 0)).toBeNull()
    expect(pctChange(50, 100)).toBe(-50)
  })
  it('ordersInRange respeta los límites', () => {
    const t = (d: string) => new Date(`${d}T00:00:00Z`).getTime()
    expect(ordersInRange(list, t('2026-10-01'), t('2026-10-02'))).toHaveLength(1)
  })
})

describe('dailySales y rankings', () => {
  const list = [
    order('2026-10-05', 1000),
    order('2026-10-05', 3000),
    order('2026-10-01', 2000),
    order('2026-08-01', 9999),
  ]
  it('serie diaria completa de N días, sin ventas fuera de la ventana', () => {
    const d = dailySales(list, NOW, 7)
    expect(d).toHaveLength(7)
    expect(d.at(-1)).toEqual({ date: '2026-10-05', total: 4000, orders: 2 })
    expect(d.reduce((n, x) => n + x.total, 0)).toBe(6000)
  })
  it('ranking de productos por unidades y desempate por ingresos', () => {
    const rank = productRanking([
      order('2026-10-05', 100, {
        lines: [
          { productId: 'x', sku: 'x', name: 'X', quantity: 2, unitPrice: 50, lineTotal: 100 },
        ],
      }),
      order('2026-10-05', 500, {
        lines: [
          { productId: 'y', sku: 'y', name: 'Y', quantity: 2, unitPrice: 250, lineTotal: 500 },
        ],
      }),
    ])
    expect(rank.map((r) => r.productId)).toEqual(['y', 'x'])
  })
  it('ventas por categoría y por medio de pago suman 100%', () => {
    const cat = salesByCategory(orders, (id) => getProductById(id)?.categoryId)
    expect(cat.reduce((n, r) => n + r.share, 0)).toBeCloseTo(1, 5)
    expect(cat[0].revenue).toBeGreaterThanOrEqual(cat.at(-1)!.revenue)
    const pay = salesByPayment(orders)
    expect(pay.map((p) => p.key).sort()).toEqual(['efectivo', 'tarjeta', 'transferencia'])
    expect(pay.reduce((n, r) => n + r.share, 0)).toBeCloseTo(1, 5)
  })
})

describe('pendingTasks', () => {
  it('cuenta pedidos por enviar o cobrar y problemas de stock', () => {
    const products = [
      mk({ id: 'a', stock: 0 }),
      mk({ id: 'b', stock: 2 }),
      mk({ id: 'c', stock: 50 }),
      mk({ id: 'd', stock: 0, status: 'borrador' }),
    ]
    const os = [
      order('2026-10-05', 1, { status: 'confirmado' }),
      order('2026-10-05', 2, { status: 'preparando' }),
      order('2026-10-05', 3, { status: 'pendiente' }),
      order('2026-10-05', 4, { status: 'entregado' }),
    ]
    expect(pendingTasks(os, products)).toEqual({
      toShip: 2,
      awaitingPayment: 1,
      outOfStock: 1,
      lowStock: 1,
      drafts: 1,
    })
  })
})

describe('buildCustomers', () => {
  it('agrupa por teléfono, calcula gasto y no suma los cancelados', () => {
    const a = (id: string, total: number, status: OrderStatus, phone = '0981 111 222') =>
      order('2026-10-01', total, {
        id,
        status,
        shippingData: { ...base.shippingData, phone, fullName: 'Ana' },
      })
    const [ana, other] = buildCustomers([
      a('1', 1000, 'entregado'),
      a('2', 3000, 'confirmado'),
      a('3', 9000, 'cancelado'),
      a('4', 500, 'entregado', '0982 000 000'),
    ])
    expect(ana).toMatchObject({
      id: '0981111222',
      orderCount: 3,
      totalSpent: 4000,
      averageTicket: 2000,
      segment: 'recurrente',
    })
    expect(other.orderCount).toBe(1)
  })
  it('segmentos: nuevo, recurrente y VIP', () => {
    expect(segmentOf(1, 100)).toBe('nuevo')
    expect(segmentOf(2, 100)).toBe('recurrente')
    expect(segmentOf(1, 60_000_000)).toBe('vip')
    expect(segmentOf(6, 100)).toBe('vip')
    expect(segmentOf(5, 100)).toBe('recurrente')
  })
})

describe('inventario', () => {
  const products = getAllProductsIncludingDrafts()
  it('una fila por variante cuando hay colores y por producto cuando no; omite borradores', () => {
    const rows = buildInventoryRows(products, 5)
    const active = products.filter((p) => p.status === 'activo')
    expect(rows.length).toBe(active.reduce((n, p) => n + Math.max(1, p.colors.length), 0))
    expect(rows.some((r) => r.name.includes('Rack para TV'))).toBe(false)
    const lenovo = rows.filter((r) => r.productId === 'p001')
    expect(lenovo).toHaveLength(3)
    expect(lenovo.every((r) => r.variant && r.id.startsWith('p001:'))).toBe(true)
  })
  it('el estado depende del umbral', () => {
    expect([stockStatus(0, 5), stockStatus(3, 5), stockStatus(6, 5), stockStatus(6, 10)]).toEqual([
      'agotado',
      'bajo',
      'ok',
      'bajo',
    ])
    const strict = summarizeInventory(buildInventoryRows(products, 0))
    const loose = summarizeInventory(buildInventoryRows(products, 30))
    expect(loose.low).toBeGreaterThan(strict.low)
    expect(strict.outOfStock).toBe(loose.outOfStock)
  })
  it('el valor del stock usa el precio con el ajuste de la variante', () => {
    const p = mk({
      id: 'z',
      price: 1000,
      stock: 5,
      colors: [
        { name: 'Rojo', hex: '#FF0000', stock: 2, priceDelta: 500 },
        { name: 'Azul', hex: '#0000FF', stock: 3 },
      ],
    })
    const rows = buildInventoryRows([p], 1)
    expect(rows.map((r) => r.value)).toEqual([3000, 3000])
    expect(summarizeInventory(rows)).toMatchObject({ units: 5, value: 6000, items: 2 })
  })
})
