import { useCallback } from 'react'
import type { Product } from '@/types/product'
import { useCart } from './useCart'
import { useToast } from './useToast'

/** Agrega al carrito y avisa con un toast. Devuelve si tuvo éxito. */
export function useAddToCart() {
  const { add } = useCart()
  const { toast } = useToast()
  return useCallback(
    (product: Product, opts?: { colorName?: string; quantity?: number }) => {
      const ok = add(product, opts)
      toast(ok ? 'Agregado al carrito' : 'Sin stock disponible')
      return ok
    },
    [add, toast],
  )
}
