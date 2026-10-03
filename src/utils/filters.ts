import type { ColorFacet, Facet, FilterOmit, Facets, ProductFilters } from '@/types/catalog'
import type { Product } from '@/types/product'
import { isInStock, isOnSale } from './product'
import { normalizeText } from './text'

function haystack(p: Product): string {
  return normalizeText(
    [p.name, p.brand, p.sku, p.shortDescription, ...(p.tags ?? []), ...Object.values(p.specs)].join(
      ' ',
    ),
  )
}

/** Todas las palabras de `q` deben aparecer (sin tildes, sin mayúsculas). */
export function matchesQuery(p: Product, q: string | undefined): boolean {
  const tokens = normalizeText(q ?? '')
    .split(/\s+/)
    .filter(Boolean)
  if (!tokens.length) return true
  const text = haystack(p)
  return tokens.every((t) => text.includes(t))
}

export function matchesFilters(p: Product, f: ProductFilters, omit: FilterOmit = {}): boolean {
  if (!matchesQuery(p, f.q)) return false
  if (f.onlyOffer && !isOnSale(p)) return false
  if (f.inStock && !isInStock(p)) return false
  if (!omit.brands && f.brands?.length && !f.brands.includes(p.brand)) return false
  if (!omit.colors && f.colors?.length && !p.colors.some((c) => f.colors!.includes(c.name)))
    return false
  if (!omit.price) {
    if (f.priceMin !== undefined && p.price < f.priceMin) return false
    if (f.priceMax !== undefined && p.price > f.priceMax) return false
  }
  for (const [key, values] of Object.entries(f.specs ?? {})) {
    if (omit.spec === key || !values.length) continue
    if (!values.includes(p.specs[key])) return false
  }
  return true
}

export function filterProducts(
  products: Product[],
  f: ProductFilters = {},
  omit: FilterOmit = {},
): Product[] {
  return products.filter((p) => matchesFilters(p, f, omit))
}

function countBy(values: string[], selected: string[] = []): Facet[] {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  for (const s of selected) if (!counts.has(s)) counts.set(s, 0)
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, 'es', { numeric: true }))
}

/**
 * Conteos por grupo de filtro. Cada grupo se calcula aplicando todos los demás filtros
 * (menos el suyo), de modo que el usuario ve cuántos resultados obtendría al marcar cada opción.
 */
export function computeFacets(
  scope: Product[],
  f: ProductFilters = {},
  specKeys: string[] = [],
): Facets {
  const forBrands = filterProducts(scope, f, { brands: true })
  const forColors = filterProducts(scope, f, { colors: true })
  const forPrice = filterProducts(scope, f, { price: true })

  const colorMap = new Map<string, ColorFacet>()
  for (const p of forColors)
    for (const c of p.colors) {
      const prev = colorMap.get(c.name)
      colorMap.set(c.name, { value: c.name, hex: c.hex, count: (prev?.count ?? 0) + 1 })
    }
  for (const name of f.colors ?? []) {
    if (colorMap.has(name)) continue
    const hex = scope.flatMap((p) => p.colors).find((c) => c.name === name)?.hex ?? '#9CA3AF'
    colorMap.set(name, { value: name, hex, count: 0 })
  }

  const specs: Record<string, Facet[]> = {}
  for (const key of specKeys) {
    const list = filterProducts(scope, f, { spec: key })
    const facets = countBy(
      list.map((p) => p.specs[key]).filter((v): v is string => v !== undefined),
      f.specs?.[key],
    )
    if (facets.length) specs[key] = facets
  }

  const prices = forPrice.map((p) => p.price)
  return {
    brands: countBy(
      forBrands.map((p) => p.brand),
      f.brands,
    ),
    colors: [...colorMap.values()].sort(
      (a, b) => b.count - a.count || a.value.localeCompare(b.value, 'es'),
    ),
    specs,
    priceRange: prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 },
  }
}
