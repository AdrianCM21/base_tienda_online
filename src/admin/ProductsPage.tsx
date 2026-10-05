import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/button-styles'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { adminPaths } from '@/config/routes'
import { useCurrency } from '@/hooks/useCurrency'
import { useDemoNotice } from '@/hooks/useDemoNotice'
import { getAllProductsIncludingDrafts, getCategory } from '@/services/catalogService'
import type { Product } from '@/types/product'
import { filterProducts } from '@/utils/filters'
import { paginate } from '@/utils/paginate'
import { isOnSale } from '@/utils/product'
import { AdminPageHeader } from './AdminPageHeader'
import { StatusBadge } from './StatusBadge'

const PAGE_SIZE = 10
const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'sin-stock', label: 'Sin stock' },
  { value: 'oferta', label: 'En oferta' },
] as const
type FilterValue = (typeof FILTERS)[number]['value']

function matchesStatus(p: Product, f: FilterValue) {
  if (f === 'activo') return p.status === 'activo'
  if (f === 'borrador') return p.status === 'borrador'
  if (f === 'sin-stock') return p.stock === 0
  if (f === 'oferta') return isOnSale(p)
  return true
}

export default function ProductsPage() {
  const { price } = useCurrency()
  const notice = useDemoNotice()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<FilterValue>('todos')
  const [page, setPage] = useState(1)

  const all = useMemo(() => getAllProductsIncludingDrafts(), [])
  const filtered = useMemo(
    () => filterProducts(all, { q }).filter((p) => matchesStatus(p, status)),
    [all, q, status],
  )
  const view = paginate(filtered, page, PAGE_SIZE)

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description={`${all.length} productos en el catálogo. Las acciones de edición son de muestra.`}
        actions={
          <>
            <Link to={adminPaths.import} className={buttonClasses('outline', 'sm')}>
              Importar desde XLSX
            </Link>
            <Button size="sm" onClick={notice}>
              <Plus size={16} aria-hidden="true" />
              Nuevo producto
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Buscar productos</span>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por nombre, marca o SKU"
            className="w-full rounded-control border border-light bg-white py-2.5 pr-3 pl-9 text-[13.5px]"
          />
        </label>
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={status === f.value}
              onClick={() => {
                setStatus(f.value)
                setPage(1)
              }}
              className={`rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold ${status === f.value ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={26} aria-hidden="true" />} title="Ningún producto coincide">
          Probá con otra búsqueda o cambiá el filtro de estado.
        </EmptyState>
      ) : (
        <>
          <p aria-live="polite" className="mb-2 text-[13px] text-muted">
            Mostrando {view.from}-{view.to} de {view.total}
          </p>
          <div className="overflow-x-auto rounded-card border border-light bg-white">
            <table className="w-full min-w-[760px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-light text-left text-xs text-muted">
                  {['Producto', 'Categoría', 'Precio', 'Stock', 'Colores', 'Estado'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {view.items.map((p) => {
                  const category = getCategory(p.categoryId)
                  return (
                    <tr key={p.id} className="border-b border-light last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-control border border-light">
                            <ProductImage alt="" icon={category?.icon} tint={p.colors[0]?.hex} />
                          </div>
                          <div className="min-w-0">
                            <div className="max-w-[260px] truncate font-semibold">{p.name}</div>
                            <div className="text-xs text-subtle">
                              {p.sku} · {p.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{category?.name}</td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap">
                        {price(p.price)}
                      </td>
                      <td className="px-4 py-2.5">{p.stock}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1">
                          {p.colors.slice(0, 4).map((c) => (
                            <span
                              key={c.name}
                              title={c.name}
                              className="h-3.5 w-3.5 rounded-full border border-black/15"
                              style={{ background: c.hex }}
                            />
                          ))}
                          {p.colors.length > 4 && (
                            <span className="text-xs text-subtle">+{p.colors.length - 4}</span>
                          )}
                          {p.colors.length === 0 && <span className="text-subtle">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex flex-wrap gap-1">
                          {p.status === 'borrador' ? (
                            <StatusBadge tone="gray">Borrador</StatusBadge>
                          ) : p.stock === 0 ? (
                            <StatusBadge tone="red">Sin stock</StatusBadge>
                          ) : (
                            <StatusBadge tone="green">Activo</StatusBadge>
                          )}
                          {isOnSale(p) && <StatusBadge tone="blue">Oferta</StatusBadge>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={notice}
                            aria-label={`Editar ${p.name}`}
                            className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={notice}
                            aria-label={`Eliminar ${p.name}`}
                            className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={view.page} pageCount={view.pageCount} onPageChange={setPage} />
        </>
      )}
    </>
  )
}
