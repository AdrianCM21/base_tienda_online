import { brand } from '@/config/brand'
import { hydrate } from './cart'
import { buildDemoOrder } from './demoOrder'
import { makeProduct as mk } from './testProducts'

const lines = (price: number, count?: number) =>
  hydrate([{ productId: 'p', quantity: 1 }], () =>
    mk({
      id: 'p',
      price,
      stock: 3,
      installments: count ? { count, interestFree: true } : undefined,
    }),
  )

describe('buildDemoOrder', () => {
  it('calcula totales, envío gratis sobre el umbral y cuotas', () => {
    const o = buildDemoOrder(lines(4590000, 12), new Date(2026, 9, 3), () => 0)
    expect(o).toMatchObject({
      id: 'PED-261003-0000',
      subtotal: 4590000,
      shipping: 0,
      total: 4590000,
      status: 'confirmado',
    })
    expect(o.payment).toMatchObject({
      method: 'tarjeta',
      cardLast4: '4242',
      installments: 3,
      installmentAmount: 1530000,
    })
  })
  it('cobra envío bajo el umbral y usa pago único si el producto no admite cuotas', () => {
    const o = buildDemoOrder(lines(100000), new Date(), () => 0)
    expect(o.shipping).toBe(brand.shippingFee)
    expect(o.payment).toMatchObject({
      installments: 1,
      installmentAmount: 100000 + brand.shippingFee,
    })
  })
})
