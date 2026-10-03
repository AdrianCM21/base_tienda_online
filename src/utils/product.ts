import type { Product, ColorVariant } from '@/types/product'

export const isOnSale = (p: Product): boolean => p.oldPrice !== undefined && p.oldPrice > p.price

export const savings = (p: Product): number => (isOnSale(p) ? p.oldPrice! - p.price : 0)

export const isInStock = (p: Product): boolean => p.stock > 0

/** Precio final de un producto con la variante de color elegida (si la hay). */
export const priceFor = (p: Product, color?: ColorVariant): number =>
  p.price + (color?.priceDelta ?? 0)

/** Precio anterior (tachado) ajustado a la variante, o undefined si no hay oferta. */
export const oldPriceFor = (p: Product, color?: ColorVariant): number | undefined =>
  isOnSale(p) ? p.oldPrice! + (color?.priceDelta ?? 0) : undefined

/** Stock disponible: el de la variante si hay color elegido, si no el del producto. */
export const stockFor = (p: Product, color?: ColorVariant): number =>
  color ? color.stock : p.stock
