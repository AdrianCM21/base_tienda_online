import type { ColorVariant, Product } from './product'

/** Lo que se persiste: producto + color elegido + cantidad. */
export type CartItem = {
  productId: string
  colorName?: string
  quantity: number
}

/** Línea ya resuelta contra el catálogo. */
export type CartLine = {
  key: string
  product: Product
  color?: ColorVariant
  quantity: number
  maxQuantity: number
  unitPrice: number
  lineTotal: number
}
