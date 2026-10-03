import type { CartItem, CartLine } from '@/types/cart'
import type { ColorVariant, Product } from '@/types/product'
import { priceFor, stockFor } from './product'

export const MAX_PER_LINE = 99

type Resolve = (productId: string) => Product | undefined

export const lineKey = (productId: string, colorName?: string): string =>
  `${productId}|${colorName ?? ''}`

const itemKey = (i: CartItem) => lineKey(i.productId, i.colorName)

const findColor = (p: Product, name?: string): ColorVariant | undefined =>
  name ? p.colors.find((c) => c.name === name) : undefined

export const maxQuantity = (p: Product, color?: ColorVariant): number =>
  Math.min(MAX_PER_LINE, Math.max(0, stockFor(p, color)))

/** Agrega unidades (sumando si ya existe) sin superar el stock. Sin stock → no cambia nada. */
export function addItem(
  items: CartItem[],
  product: Product,
  colorName: string | undefined,
  qty = 1,
): CartItem[] {
  const color = findColor(product, colorName)
  if (product.colors.length && !color) return items
  const max = maxQuantity(product, color)
  if (max <= 0 || qty <= 0) return items
  const key = lineKey(product.id, color?.name)
  const existing = items.find((i) => itemKey(i) === key)
  if (!existing)
    return [
      ...items,
      { productId: product.id, colorName: color?.name, quantity: Math.min(qty, max) },
    ]
  // Ya está al máximo: sin cambios (el llamador lo interpreta como "sin stock disponible").
  if (Math.min(existing.quantity + qty, max) === existing.quantity) return items
  return items.map((i) =>
    itemKey(i) === key ? { ...i, quantity: Math.min(i.quantity + qty, max) } : i,
  )
}

/** Fija la cantidad de una línea (0 o menos la elimina; se ajusta al stock). */
export function setItemQuantity(
  items: CartItem[],
  key: string,
  qty: number,
  resolve: Resolve,
): CartItem[] {
  if (!Number.isFinite(qty) || qty <= 0) return removeItem(items, key)
  return items.map((i) => {
    if (itemKey(i) !== key) return i
    const p = resolve(i.productId)
    const max = p ? maxQuantity(p, findColor(p, i.colorName)) : i.quantity
    return { ...i, quantity: Math.max(1, Math.min(Math.floor(qty), max)) }
  })
}

export const removeItem = (items: CartItem[], key: string): CartItem[] =>
  items.filter((i) => itemKey(i) !== key)

/** Resuelve items contra el catálogo; descarta productos/colores que ya no existen o sin stock. */
export function hydrate(items: CartItem[], resolve: Resolve): CartLine[] {
  const lines: CartLine[] = []
  for (const item of items) {
    const product = resolve(item.productId)
    if (!product) continue
    const color = findColor(product, item.colorName)
    if (item.colorName && !color) continue
    const max = maxQuantity(product, color)
    if (max <= 0) continue
    const quantity = Math.max(1, Math.min(item.quantity, max))
    const unitPrice = priceFor(product, color)
    lines.push({
      key: itemKey(item),
      product,
      color,
      quantity,
      maxQuantity: max,
      unitPrice,
      lineTotal: unitPrice * quantity,
    })
  }
  return lines
}

export const cartCount = (lines: CartLine[]): number => lines.reduce((n, l) => n + l.quantity, 0)

export const cartSubtotal = (lines: CartLine[]): number =>
  lines.reduce((n, l) => n + l.lineTotal, 0)

/** Valida lo leído de localStorage. */
export function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (i): i is CartItem =>
      !!i &&
      typeof i.productId === 'string' &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0 &&
      (i.colorName === undefined || typeof i.colorName === 'string'),
  )
}
