import type { SortKey } from '@/types/catalog'
import type { Product } from '@/types/product'
import { isInStock } from './product'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevancia', label: 'Más relevantes' },
  { value: 'menor-precio', label: 'Menor precio' },
  { value: 'mayor-precio', label: 'Mayor precio' },
  { value: 'nuevos', label: 'Más nuevos' },
]

export const DEFAULT_SORT: SortKey = 'relevancia'

export const isSortKey = (v: unknown): v is SortKey => SORT_OPTIONS.some((o) => o.value === v)

function relevanceScore(p: Product): number {
  const featured = p.tags?.includes('destacado') ? 10_000 : 0
  const popularity = (p.rating ?? 0) * (p.reviewCount ?? 0)
  return (isInStock(p) ? 0 : -1_000_000) + featured + popularity
}

/** Devuelve una copia ordenada (el orden es estable y desempata por nombre). */
export function sortProducts(products: Product[], key: SortKey = DEFAULT_SORT): Product[] {
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'es')
  const cmp: Record<SortKey, (a: Product, b: Product) => number> = {
    relevancia: (a, b) => relevanceScore(b) - relevanceScore(a) || byName(a, b),
    'menor-precio': (a, b) => a.price - b.price || byName(a, b),
    'mayor-precio': (a, b) => b.price - a.price || byName(a, b),
    nuevos: (a, b) => b.createdAt.localeCompare(a.createdAt) || byName(a, b),
  }
  return [...products].sort(cmp[key])
}
