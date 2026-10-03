import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getProductById } from '@/services/catalogService'
import type { CartItem } from '@/types/cart'
import {
  addItem,
  cartCount,
  cartSubtotal,
  hydrate,
  removeItem,
  sanitizeItems,
  setItemQuantity,
} from '@/utils/cart'
import { readStorage, writeStorage } from '@/utils/storage'
import { CartContext, type CartContextValue } from './cart-context'

export const CART_STORAGE_KEY = 'tienda-demo:cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    sanitizeItems(readStorage<unknown>(CART_STORAGE_KEY, [])),
  )
  // Espejo síncrono: permite varias acciones seguidas antes del siguiente render.
  const itemsRef = useRef(items)

  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, items)
  }, [items])

  const commit = useCallback((next: CartItem[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  const lines = useMemo(() => hydrate(items, getProductById), [items])

  const add = useCallback<CartContextValue['add']>(
    (product, opts) => {
      const current = itemsRef.current
      const next = addItem(
        current,
        product,
        opts?.colorName ?? product.colors.find((c) => c.stock > 0)?.name,
        opts?.quantity ?? 1,
      )
      if (next === current) return false
      commit(next)
      return true
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      lines,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      add,
      setQuantity: (key: string, quantity: number) =>
        commit(setItemQuantity(itemsRef.current, key, quantity, getProductById)),
      remove: (key: string) => commit(removeItem(itemsRef.current, key)),
      clear: () => commit([]),
    }),
    [lines, add, commit],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
