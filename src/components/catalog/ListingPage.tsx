import { SearchX, SlidersHorizontal } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useCatalogParams } from '@/hooks/useCatalogParams'
import { queryProducts } from '@/services/catalogService'
import { filterChips } from '@/utils/filterChips'
import { Breadcrumb, type Crumb } from '../ui/Breadcrumb'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Pagination } from '../ui/Pagination'
import { ActiveFilters } from './ActiveFilters'
import { FilterSidebar } from './FilterSidebar'
import { ProductCard } from './ProductCard'
import { ProductGrid } from './ProductGrid'
import { SortSelect } from './SortSelect'

type Props = {
  breadcrumb: Crumb[]
  title: string
  /** Texto bajo el título; por defecto "N productos". */
  subtitle?: string
  category?: string
  subcategory?: string
  /** Para destacar la categoría en la lista lateral. */
  activeCategory?: string
  /** Contenido extra entre el título y los resultados (p. ej. subcategorías). */
  extra?: ReactNode
  emptyHint?: string
}

/** Listado con sidebar de filtros, orden, paginación y estado en la URL (categoría y búsqueda). */
export function ListingPage({
  breadcrumb,
  title,
  subtitle,
  category,
  subcategory,
  activeCategory,
  extra,
  emptyHint,
}: Props) {
  const { state, key, setFilters, setSort, setPage } = useCatalogParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const resultsRef = useRef<HTMLDivElement>(null)

  const result = useMemo(
    () =>
      queryProducts({
        category,
        subcategory,
        filters: state.filters,
        sort: state.sort,
        page: state.page,
      }),
    [category, subcategory, state],
  )
  const activeCount = filterChips(state.filters).length
  const hasFilters = activeCount > 0 || !!state.filters.q

  const sidebar = (
    <FilterSidebar
      key={`${key}|${category}|${subcategory}`}
      filters={state.filters}
      facets={result.facets}
      activeCategory={activeCategory}
      onApply={setFilters}
      onDone={closeDrawer}
    />
  )

  const goToPage = (p: number) => {
    setPage(p)
    resultsRef.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <>
      <Breadcrumb items={breadcrumb} />
      <div className="px-6 pt-4 pb-2">
        <h1 className="m-0 text-[28px] font-bold">{title}</h1>
        <div className="mt-1 text-[13.5px] text-muted">
          {subtitle ?? `${result.scopeTotal} ${result.scopeTotal === 1 ? 'producto' : 'productos'}`}
        </div>
        {extra}
      </div>

      <div className="flex items-start gap-6 px-6 pt-2 pb-12">
        <aside
          aria-label="Filtros"
          className="hidden w-[260px] shrink-0 rounded-card border border-light bg-white p-5 min-[900px]:block"
        >
          {sidebar}
        </aside>

        <div ref={resultsRef} className="min-w-0 flex-1 scroll-mt-4">
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-control border border-light bg-white px-3.5 py-2 text-[13.5px] font-semibold text-dark hover:bg-light min-[900px]:hidden"
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filtros{activeCount > 0 && ` (${activeCount})`}
              </button>
              <p aria-live="polite" className="m-0 text-[13.5px] text-muted">
                {result.total === 0
                  ? '0 resultados'
                  : `Mostrando ${result.from}-${result.to} de ${result.total} resultados`}
              </p>
            </div>
            <SortSelect value={state.sort} onChange={setSort} />
          </div>

          <ActiveFilters filters={state.filters} onChange={setFilters} />

          {result.total === 0 ? (
            <EmptyState
              icon={<SearchX size={26} aria-hidden="true" />}
              title="No encontramos productos"
              action={
                hasFilters ? (
                  <Button onClick={() => setFilters({})}>Quitar filtros y búsqueda</Button>
                ) : undefined
              }
            >
              {emptyHint ?? 'Probá con otros filtros o revisá otra categoría.'}
            </EmptyState>
          ) : (
            <>
              <ProductGrid>
                {result.items.map((p) => (
                  <ProductCard key={p.id} product={p} showBrand />
                ))}
              </ProductGrid>
              <Pagination page={result.page} pageCount={result.pageCount} onPageChange={goToPage} />
            </>
          )}
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title="Filtros">
        <div className="p-5">{sidebar}</div>
      </Drawer>
    </>
  )
}
