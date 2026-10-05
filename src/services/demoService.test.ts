import {
  DEMO_BAR_STORAGE_KEY,
  ensureSampleOrder,
  resetDemoStorage,
  sampleCartItems,
} from './demoService'
import { SAMPLE_CART } from '@/config/demoScreens'
import { getProductById } from './catalogService'
import { listOrders } from '@/utils/orders'

describe('demoService', () => {
  it('el carrito de ejemplo resuelve todos sus productos, con color válido y en stock', () => {
    const items = sampleCartItems()
    expect(items).toHaveLength(SAMPLE_CART.length)
    for (const i of items) {
      const p = getProductById(i.productId)!
      expect(p).toBeDefined()
      if (p.colors.length)
        expect(p.colors.find((c) => c.name === i.colorName)?.stock).toBeGreaterThan(0)
    }
  })
  it('ensureSampleOrder crea un pedido una sola vez y luego lo reutiliza', () => {
    const first = ensureSampleOrder()
    expect(first.lines.length).toBeGreaterThan(0)
    expect(listOrders()).toHaveLength(1)
    expect(ensureSampleOrder().id).toBe(first.id)
    expect(listOrders()).toHaveLength(1)
  })
  it('resetDemoStorage limpia todo menos la preferencia de la barra', () => {
    window.localStorage.setItem('tienda-demo:cart', '[]')
    window.localStorage.setItem('tienda-demo:orders', '[]')
    window.localStorage.setItem(DEMO_BAR_STORAGE_KEY, '"1"')
    window.localStorage.setItem('ajeno', 'x')
    resetDemoStorage()
    expect(window.localStorage.getItem('tienda-demo:cart')).toBeNull()
    expect(window.localStorage.getItem('tienda-demo:orders')).toBeNull()
    expect(window.localStorage.getItem(DEMO_BAR_STORAGE_KEY)).toBe('"1"')
    expect(window.localStorage.getItem('ajeno')).toBe('x')
  })
})
