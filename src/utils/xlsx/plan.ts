import type { Product } from '@/types/product'

export type ImportMode = 'upsert' | 'create' | 'update-stock-price'

export const IMPORT_MODES: { value: ImportMode; label: string; hint: string }[] = [
  {
    value: 'upsert',
    label: 'Crear nuevos y actualizar existentes',
    hint: 'Compara por SKU: crea los que no existen y actualiza los que sí.',
  },
  {
    value: 'create',
    label: 'Solo crear productos nuevos',
    hint: 'Los SKU que ya existen se omiten.',
  },
  {
    value: 'update-stock-price',
    label: 'Solo actualizar precios y stock',
    hint: 'No crea productos ni toca nombres o descripciones. Ideal para listas de precios.',
  },
]

export type ImportAction = 'nuevo' | 'actualizado' | 'sin-cambios' | 'omitido'

export type PlannedItem = { product: Product; action: ImportAction; changes: string[] }

export type ImportPlan = {
  items: PlannedItem[]
  counts: {
    nuevo: number
    actualizado: number
    sinCambios: number
    omitido: number
    /** Cuántos productos se escribirían. */ applied: number
  }
}

const FULL_FIELDS: [string, (p: Product) => unknown][] = [
  ['nombre', (p) => p.name],
  ['marca', (p) => p.brand],
  ['precio', (p) => p.price],
  ['precio anterior', (p) => p.oldPrice ?? null],
  ['stock', (p) => p.stock],
  ['estado', (p) => p.status],
  ['descripción corta', (p) => p.shortDescription],
]
const STOCK_PRICE_FIELDS = FULL_FIELDS.filter(([k]) =>
  ['precio', 'precio anterior', 'stock'].includes(k),
)

/**
 * Qué pasaría al importar `imported` sobre el catálogo `existing`, según el modo elegido
 * (solo cálculo: la demo no modifica el catálogo).
 */
export function planImport(imported: Product[], existing: Product[], mode: ImportMode): ImportPlan {
  const bySku = new Map(existing.map((p) => [p.sku, p]))
  const items: PlannedItem[] = imported.map((product) => {
    const current = bySku.get(product.sku)
    if (!current)
      return { product, action: mode === 'update-stock-price' ? 'omitido' : 'nuevo', changes: [] }
    if (mode === 'create') return { product, action: 'omitido', changes: [] }
    const fields = mode === 'update-stock-price' ? STOCK_PRICE_FIELDS : FULL_FIELDS
    const changes = fields
      .filter(([, get]) => get(product) !== get(current))
      .map(([label]) => label)
    return { product, action: changes.length ? 'actualizado' : 'sin-cambios', changes }
  })
  const count = (a: ImportAction) => items.filter((i) => i.action === a).length
  const nuevo = count('nuevo')
  const actualizado = count('actualizado')
  return {
    items,
    counts: {
      nuevo,
      actualizado,
      sinCambios: count('sin-cambios'),
      omitido: count('omitido'),
      applied: nuevo + actualizado,
    },
  }
}
