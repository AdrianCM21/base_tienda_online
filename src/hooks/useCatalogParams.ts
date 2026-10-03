import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductFilters, SortKey } from '@/types/catalog'
import { buildCatalogParams, parseCatalogParams, type CatalogUrlState } from '@/utils/catalogParams'

/** Estado del listado (filtros, orden, página) sincronizado con la URL. */
export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const serialized = searchParams.toString()
  const state = useMemo(() => parseCatalogParams(new URLSearchParams(serialized)), [serialized])

  const update = useCallback(
    (next: CatalogUrlState) => setSearchParams(buildCatalogParams(next)),
    [setSearchParams],
  )

  return {
    state,
    /** Clave estable del estado actual (sirve para reiniciar formularios locales). */
    key: serialized,
    setFilters: (filters: ProductFilters) => update({ ...state, filters, page: 1 }),
    setSort: (sort: SortKey) => update({ ...state, sort, page: 1 }),
    setPage: (page: number) => update({ ...state, page }),
  }
}
