import type { ProductFilters, SortKey } from '@/types/catalog'
import { DEFAULT_SORT, isSortKey } from './sort'

/** Estado del listado que vive en la URL (filtros + orden + página). */
export type CatalogUrlState = {
  filters: ProductFilters
  sort: SortKey
  page: number
}

const SPEC_PREFIX = 'f.'
const uniq = (list: string[]) => [...new Set(list.map((v) => v.trim()).filter(Boolean))]
const toInt = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined)

/**
 * Parámetros: q, marca (repetido), color (repetido), precio=min-max, ofertas=1,
 * f.<Especificación> (repetido), orden, pagina.
 */
export function parseCatalogParams(sp: URLSearchParams): CatalogUrlState {
  const filters: ProductFilters = {}
  const q = sp.get('q')?.trim()
  if (q) filters.q = q
  const brands = uniq(sp.getAll('marca'))
  if (brands.length) filters.brands = brands
  const colors = uniq(sp.getAll('color'))
  if (colors.length) filters.colors = colors

  const price = /^(\d*)-(\d*)$/.exec(sp.get('precio') ?? '')
  if (price) {
    const min = toInt(price[1])
    const max = toInt(price[2])
    if (min !== undefined) filters.priceMin = min
    if (max !== undefined) filters.priceMax = max
  }
  if (sp.get('ofertas') === '1') filters.onlyOffer = true

  const specs: Record<string, string[]> = {}
  for (const key of new Set(sp.keys())) {
    if (!key.startsWith(SPEC_PREFIX)) continue
    const values = uniq(sp.getAll(key))
    if (values.length) specs[key.slice(SPEC_PREFIX.length)] = values
  }
  if (Object.keys(specs).length) filters.specs = specs

  const sortParam = sp.get('orden')
  const page = toInt(sp.get('pagina') ?? undefined)
  return {
    filters,
    sort: isSortKey(sortParam) ? sortParam : DEFAULT_SORT,
    page: page && page > 0 ? page : 1,
  }
}

/** Inverso de `parseCatalogParams`; omite los valores por defecto para mantener la URL limpia. */
export function buildCatalogParams({ filters, sort, page }: CatalogUrlState): URLSearchParams {
  const sp = new URLSearchParams()
  if (filters.q?.trim()) sp.set('q', filters.q.trim())
  for (const b of uniq(filters.brands ?? [])) sp.append('marca', b)
  for (const c of uniq(filters.colors ?? [])) sp.append('color', c)
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    sp.set('precio', `${filters.priceMin ?? ''}-${filters.priceMax ?? ''}`)
  }
  if (filters.onlyOffer) sp.set('ofertas', '1')
  for (const [key, values] of Object.entries(filters.specs ?? {})) {
    for (const v of uniq(values)) sp.append(SPEC_PREFIX + key, v)
  }
  if (sort !== DEFAULT_SORT) sp.set('orden', sort)
  if (page > 1) sp.set('pagina', String(page))
  return sp
}
