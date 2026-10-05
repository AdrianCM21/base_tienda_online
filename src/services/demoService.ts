import { SAMPLE_CART } from '@/config/demoScreens'
import type { CartItem } from '@/types/cart'
import type { Order } from '@/types/order'
import { hydrate } from '@/utils/cart'
import { buildDemoOrder } from '@/utils/demoOrder'
import { listOrders, saveOrder } from '@/utils/orders'
import { clearStorageByPrefix } from '@/utils/storage'
import { getProduct, getProductById } from './catalogService'

export const APP_STORAGE_PREFIX = 'tienda-demo:'
/** La preferencia de mostrar/ocultar la barra sobrevive al reinicio de la demo. */
export const DEMO_BAR_STORAGE_KEY = `${APP_STORAGE_PREFIX}demo-bar-hidden`

/** Items del carrito de ejemplo (omite los productos que ya no existan). */
export function sampleCartItems(): CartItem[] {
  return SAMPLE_CART.flatMap((s) => {
    const product = getProduct(s.slug)
    if (!product) return []
    const colorName = s.colorName ?? product.colors.find((c) => c.stock > 0)?.name
    return [{ productId: product.id, colorName, quantity: s.quantity }]
  })
}

/** Devuelve el pedido más reciente o, si no hay ninguno, crea y guarda uno de ejemplo. */
export function ensureSampleOrder(): Order {
  const existing = listOrders()[0]
  if (existing) return existing
  const order = buildDemoOrder(hydrate(sampleCartItems(), getProductById))
  saveOrder(order)
  return order
}

/** Borra carrito, pedidos, moneda y tema guardados (conserva si la barra está oculta). */
export function resetDemoStorage(): void {
  clearStorageByPrefix(APP_STORAGE_PREFIX, [DEMO_BAR_STORAGE_KEY])
}
