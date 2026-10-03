import type { Product } from '@/types/product'
import { makeProduct as mk } from './testProducts'
import {
  addItem,
  cartCount,
  cartSubtotal,
  hydrate,
  lineKey,
  removeItem,
  sanitizeItems,
  setItemQuantity,
} from './cart'

const red = { name: 'Rojo', hex: '#FF0000', stock: 3 }
const blue = { name: 'Azul', hex: '#0000FF', stock: 0 }
const colored = mk({ id: 'c', price: 1000, stock: 3, colors: [red, { ...blue, priceDelta: 500 }] })
const plain = mk({ id: 'p', price: 200, stock: 2 })
const catalog: Record<string, Product> = { c: colored, p: plain }
const resolve = (id: string) => catalog[id]

describe('cart utils', () => {
  it('agrega y suma cantidades de la misma línea (producto + color)', () => {
    let items = addItem([], plain, undefined)
    items = addItem(items, plain, undefined)
    expect(items).toEqual([{ productId: 'p', colorName: undefined, quantity: 2 }])
    items = addItem(items, colored, 'Rojo')
    expect(items).toHaveLength(2)
  })
  it('no supera el stock', () => {
    const items = addItem(addItem([], plain, undefined, 5), plain, undefined, 5)
    expect(items[0].quantity).toBe(2)
  })
  it('devuelve la misma lista si la línea ya está al máximo', () => {
    const full = addItem([], plain, undefined, 2)
    expect(addItem(full, plain, undefined)).toBe(full)
  })
  it('rechaza sin stock, color inexistente o color obligatorio ausente', () => {
    const base: never[] = []
    expect(addItem(base, colored, 'Azul')).toBe(base)
    expect(addItem(base, colored, 'Verde')).toBe(base)
    expect(addItem(base, colored, undefined)).toBe(base)
    expect(addItem(base, mk({ stock: 0 }), undefined)).toBe(base)
  })
  it('setItemQuantity ajusta a stock y elimina con 0', () => {
    const items = addItem([], plain, undefined)
    const key = lineKey('p')
    expect(setItemQuantity(items, key, 99, resolve)[0].quantity).toBe(2)
    expect(setItemQuantity(items, key, 0, resolve)).toEqual([])
    expect(setItemQuantity(items, key, NaN, resolve)).toEqual([])
  })
  it('removeItem', () => {
    expect(removeItem(addItem([], plain, undefined), lineKey('p'))).toEqual([])
  })
  it('hydrate calcula precios (con priceDelta), totales y descarta inválidos', () => {
    const items = [
      { productId: 'c', colorName: 'Rojo', quantity: 2 },
      { productId: 'p', quantity: 1 },
      { productId: 'zzz', quantity: 1 },
      { productId: 'c', colorName: 'Azul', quantity: 1 },
    ]
    const lines = hydrate(items, resolve)
    expect(lines.map((l) => l.key)).toEqual(['c|Rojo', 'p|'])
    expect(cartCount(lines)).toBe(3)
    expect(cartSubtotal(lines)).toBe(2 * 1000 + 200)
  })
  it('hydrate recorta cantidades que exceden el stock actual', () => {
    expect(hydrate([{ productId: 'p', quantity: 50 }], resolve)[0].quantity).toBe(2)
  })
  it('sanitizeItems descarta basura', () => {
    expect(sanitizeItems('x')).toEqual([])
    expect(
      sanitizeItems([
        { productId: 'a', quantity: 1 },
        { productId: 1 },
        null,
        { productId: 'b', quantity: 0 },
      ]),
    ).toEqual([{ productId: 'a', quantity: 1 }])
  })
})
