import type { ProductFilters } from '@/types/catalog'
import { formatGs } from './format'

export type FilterChip = {
  key: string
  label: string
  /** Filtros resultantes de quitar este chip. */
  without: ProductFilters
}

/** Chips de filtros activos (la búsqueda `q` no cuenta: tiene su propia UI). */
export function filterChips(f: ProductFilters): FilterChip[] {
  const chips: FilterChip[] = []
  for (const b of f.brands ?? [])
    chips.push({
      key: `marca:${b}`,
      label: b,
      without: { ...f, brands: f.brands!.filter((x) => x !== b) },
    })
  for (const c of f.colors ?? [])
    chips.push({
      key: `color:${c}`,
      label: c,
      without: { ...f, colors: f.colors!.filter((x) => x !== c) },
    })
  for (const [key, values] of Object.entries(f.specs ?? {}))
    for (const v of values) {
      const rest = { ...f.specs, [key]: values.filter((x) => x !== v) }
      chips.push({ key: `${key}:${v}`, label: v, without: { ...f, specs: rest } })
    }
  if (f.priceMin !== undefined || f.priceMax !== undefined) {
    const label =
      f.priceMin !== undefined && f.priceMax !== undefined
        ? `${formatGs(f.priceMin)} – ${formatGs(f.priceMax)}`
        : f.priceMin !== undefined
          ? `Desde ${formatGs(f.priceMin)}`
          : `Hasta ${formatGs(f.priceMax!)}`
    chips.push({
      key: 'precio',
      label,
      without: { ...f, priceMin: undefined, priceMax: undefined },
    })
  }
  if (f.onlyOffer)
    chips.push({ key: 'ofertas', label: 'En oferta', without: { ...f, onlyOffer: false } })
  return chips
}

/** Quita todos los filtros menos la búsqueda de texto. */
export const clearFilters = (f: ProductFilters): ProductFilters => (f.q ? { q: f.q } : {})
