import type { Product } from '@/types/product'

export type ProductEdit = { status?: 'activo' | 'borrador'; price?: number; removed?: boolean }
export type Edits = Record<string, ProductEdit>

export type BulkAction =
  | { kind: 'status'; status: 'activo' | 'borrador' }
  | { kind: 'price'; percent: number }
  | { kind: 'remove' }

export const MIN_PERCENT = -90
export const MAX_PERCENT = 200

/** Aplica un porcentaje al precio y lo redondea a la centena (nunca por debajo de Gs. 100). */
export const priceWithPercent = (price: number, percent: number): number =>
  Math.max(100, Math.round((price * (1 + percent / 100)) / 100) * 100)

/** Valida el porcentaje escrito en el diálogo: entero, distinto de 0, entre -90 y +200. */
export function parsePercent(
  text: string,
): { ok: true; value: number } | { ok: false; error: string } {
  if (!/^[+-]?\d+$/.test(text.trim()))
    return { ok: false, error: 'Ingresá un número entero, por ejemplo 10 o -15' }
  const value = Number(text)
  if (value === 0) return { ok: false, error: 'El porcentaje no puede ser 0' }
  if (value < MIN_PERCENT || value > MAX_PERCENT)
    return { ok: false, error: `Debe estar entre ${MIN_PERCENT}% y +${MAX_PERCENT}%` }
  return { ok: true, value }
}

/** Efecto de una acción en lote sobre los productos `ids` (devuelve un `Edits` nuevo; no muta el original). */
export function applyBulk(
  edits: Edits,
  ids: string[],
  action: BulkAction,
  products: Product[],
): Edits {
  const byId = new Map(products.map((p) => [p.id, p]))
  const next: Edits = { ...edits }
  for (const id of ids) {
    const product = byId.get(id)
    if (!product) continue
    const cur = next[id] ?? {}
    if (action.kind === 'status') next[id] = { ...cur, status: action.status }
    else if (action.kind === 'remove') next[id] = { ...cur, removed: true }
    else next[id] = { ...cur, price: priceWithPercent(cur.price ?? product.price, action.percent) }
  }
  return next
}

/** Productos con las ediciones aplicadas. Si el nuevo precio alcanza al anterior, deja de ser oferta. */
export function applyEdits(products: Product[], edits: Edits): Product[] {
  return products
    .filter((p) => !edits[p.id]?.removed)
    .map((p) => {
      const e = edits[p.id]
      if (!e) return p
      const price = e.price ?? p.price
      const oldPrice = p.oldPrice !== undefined && p.oldPrice > price ? p.oldPrice : undefined
      return { ...p, status: e.status ?? p.status, price, oldPrice }
    })
}

/** Cantidad de productos con algún cambio pendiente. */
export const countEdits = (edits: Edits): number => Object.keys(edits).length

export const ACTION_LABEL = {
  status: { activo: 'Activar', borrador: 'Pasar a borrador' },
  price: 'Cambiar precio',
  remove: 'Eliminar',
} as const
