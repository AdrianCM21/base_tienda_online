import { isInStock, isOnSale, priceFor, savings } from './product'
import { makeProduct as mk } from './testProducts'

describe('product utils', () => {
  it('oferta y ahorro', () => {
    const p = mk({ price: 4590000, oldPrice: 5190000 })
    expect(isOnSale(p)).toBe(true)
    expect(savings(p)).toBe(600000)
    expect(isOnSale(mk({ price: 10, oldPrice: 10 }))).toBe(false)
    expect(savings(mk())).toBe(0)
  })
  it('stock y precio por variante', () => {
    expect(isInStock(mk({ stock: 0 }))).toBe(false)
    expect(
      priceFor(mk({ price: 100 }), { name: 'x', hex: '#000000', stock: 1, priceDelta: 50 }),
    ).toBe(150)
    expect(priceFor(mk({ price: 100 }))).toBe(100)
  })
})
