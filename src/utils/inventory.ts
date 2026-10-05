import type { Product } from '@/types/product'

export type StockStatus = 'agotado' | 'bajo' | 'ok'

export type InventoryRow = {
  /** `id` del producto, o `id:color` para una variante. */
  id: string
  productId: string
  name: string
  brand: string
  categoryId: string
  sku: string
  /** Nombre y color de la variante (o undefined si el producto no tiene). */
  variant?: { name: string; hex: string }
  stock: number
  unitPrice: number
  /** Valor del stock a precio de venta. */
  value: number
  status: StockStatus
}

export const stockStatus = (stock: number, threshold: number): StockStatus =>
  stock <= 0 ? 'agotado' : stock <= threshold ? 'bajo' : 'ok'

/** Una fila por producto o, si tiene colores, una por variante (con su propio stock). Solo productos publicados. */
export function buildInventoryRows(products: Product[], threshold: number): InventoryRow[] {
  return products
    .filter((p) => p.status === 'activo')
    .flatMap((p): InventoryRow[] => {
      if (!p.colors.length) {
        return [
          {
            id: p.id,
            productId: p.id,
            name: p.name,
            brand: p.brand,
            categoryId: p.categoryId,
            sku: p.sku,
            stock: p.stock,
            unitPrice: p.price,
            value: p.stock * p.price,
            status: stockStatus(p.stock, threshold),
          },
        ]
      }
      return p.colors.map((c) => {
        const unitPrice = p.price + (c.priceDelta ?? 0)
        return {
          id: `${p.id}:${c.name}`,
          productId: p.id,
          name: p.name,
          brand: p.brand,
          categoryId: p.categoryId,
          sku: c.sku ?? p.sku,
          variant: { name: c.name, hex: c.hex },
          stock: c.stock,
          unitPrice,
          value: c.stock * unitPrice,
          status: stockStatus(c.stock, threshold),
        }
      })
    })
}

export type InventorySummary = {
  units: number
  value: number
  outOfStock: number
  low: number
  items: number
}

export function summarizeInventory(rows: InventoryRow[]): InventorySummary {
  return {
    units: rows.reduce((n, r) => n + r.stock, 0),
    value: rows.reduce((n, r) => n + r.value, 0),
    outOfStock: rows.filter((r) => r.status === 'agotado').length,
    low: rows.filter((r) => r.status === 'bajo').length,
    items: rows.length,
  }
}
