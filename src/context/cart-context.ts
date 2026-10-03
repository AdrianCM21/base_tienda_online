import { createContext } from 'react'
import type { CartLine } from '@/types/cart'
import type { Product } from '@/types/product'

export type CartContextValue = {
  lines: CartLine[]
  /** Unidades totales (para el badge del header). */
  count: number
  subtotal: number
  /** Devuelve false si no se pudo agregar (sin stock o color inválido). */
  add: (product: Product, opts?: { colorName?: string; quantity?: number }) => boolean
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
