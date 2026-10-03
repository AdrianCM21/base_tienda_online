import type { Order } from '@/types/order'
import { emptyShipping } from './checkout'
import {
  createOrderId,
  getOrder,
  listOrders,
  ORDERS_STORAGE_KEY,
  saveOrder,
  toOrderLines,
} from './orders'
import { hydrate } from './cart'
import { makeProduct as mk } from './testProducts'

const order = (id: string): Order => ({
  id,
  createdAt: '2026-10-03T12:00:00.000Z',
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  shippingData: emptyShipping,
  payment: { method: 'efectivo', installments: 1, installmentAmount: 0 },
  status: 'confirmado',
})

describe('orders', () => {
  it('createOrderId es legible y determinista con random fijo', () => {
    expect(createOrderId(new Date(2026, 9, 3), () => 0)).toBe('PED-261003-0000')
    expect(createOrderId(new Date(2026, 9, 3), () => 0.5)).toMatch(/^PED-261003-[0-9A-Z]{4}$/)
  })
  it('guarda, lista (más reciente primero) y recupera', () => {
    saveOrder(order('A'))
    saveOrder(order('B'))
    expect(listOrders().map((o) => o.id)).toEqual(['B', 'A'])
    expect(getOrder('A')?.id).toBe('A')
    expect(getOrder('Z')).toBeUndefined()
  })
  it('tolera datos corruptos', () => {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, '"basura"')
    expect(listOrders()).toEqual([])
  })
  it('toOrderLines usa el sku de la variante', () => {
    const p = mk({
      id: 'p',
      sku: 'TD-1',
      price: 100,
      stock: 5,
      colors: [{ name: 'Rojo', hex: '#FF0000', stock: 5, sku: 'TD-1-ROJ' }],
    })
    const lines = hydrate([{ productId: 'p', colorName: 'Rojo', quantity: 2 }], () => p)
    expect(toOrderLines(lines)).toEqual([
      {
        productId: 'p',
        sku: 'TD-1-ROJ',
        name: 'Producto',
        colorName: 'Rojo',
        quantity: 2,
        unitPrice: 100,
        lineTotal: 200,
      },
    ])
  })
})
