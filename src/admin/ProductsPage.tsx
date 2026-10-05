import { Download, FileSpreadsheet, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductImage } from '@/components/catalog/ProductImage'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/button-styles'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { adminPaths } from '@/config/routes'
import { useCurrency } from '@/hooks/useCurrency'
import { useActivity } from '@/hooks/useActivity'
import { useDemoNotice } from '@/hooks/useDemoNotice'
import { useToast } from '@/hooks/useToast'
import {
  getAllProductsIncludingDrafts,
  getCategories,
  getCategory,
} from '@/services/catalogService'
import type { Product } from '@/types/product'
import { toCsv } from '@/utils/adminExport'
import {
  ACTION_LABEL,
  applyBulk,
  applyEdits,
  parsePercent,
  type BulkAction,
  type Edits,
} from '@/utils/bulkProducts'
import { downloadBlob } from '@/utils/download'
import { filterProducts } from '@/utils/filters'
import { isOnSale } from '@/utils/product'
import { buildCatalogExport } from '@/utils/xlsx/export'
import { AdminPageHeader } from './AdminPageHeader'
import { StatusBadge } from './StatusBadge'

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'sin-stock', label: 'Sin stock' },
  { value: 'oferta', label: 'En oferta' },
] as const
type FilterValue = (typeof FILTERS)[number]['value']

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function matchesStatus(p: Product, f: FilterValue) {
  if (f === 'activo') return p.status === 'activo'
  if (f === 'borrador') return p.status === 'borrador'
  if (f === 'sin-stock') return p.stock === 0
  if (f === 'oferta') return isOnSale(p)
  return true
}

const CSV_MIME = 'text/csv;charset=utf-8'

type Pending = { ids: string[]; clear: () => void; kind: 'price' | 'remove' }

export default function ProductsPage() {
  const { price } = useCurrency()
  const notice = useDemoNotice()
  const { toast } = useToast()
  const { log } = useActivity()
  // Cambios hechos en pantalla (no se guardan: al recargar vuelve el catálogo original).
  const [edits, setEdits] = useState<Edits>({})
  const [pending, setPending] = useState<Pending | null>(null)
  const [percentText, setPercentText] = useState('10')
  const [q, setQ] = useState('')
  const [params] = useSearchParams()
  // ?filtro=borrador abre la lista ya filtrada (enlaces de "Por hacer").
  const [status, setStatus] = useState<FilterValue>(
    () => FILTERS.find((f) => f.value === params.get('filtro'))?.value ?? 'todos',
  )
  const [category, setCategory] = useState('')

  const base = useMemo(() => getAllProductsIncludingDrafts(), [])
  const all = useMemo(() => applyEdits(base, edits), [base, edits])
  const filtered = useMemo(
    () =>
      filterProducts(all, { q }).filter(
        (p) => matchesStatus(p, status) && (!category || p.categoryId === category),
      ),
    [all, q, status, category],
  )

  const exportCatalog = async () =>
    downloadBlob(
      await buildCatalogExport(all, getCategories()),
      'catalogo-productos.xlsx',
      XLSX_MIME,
    )

  const percent = parsePercent(percentText)

  const run = (ids: string[], action: BulkAction, clear: () => void) => {
    const before = edits
    setEdits(applyBulk(before, ids, action, base))
    clear()
    const label =
      action.kind === 'status'
        ? ACTION_LABEL.status[action.status]
        : action.kind === 'price'
          ? `${ACTION_LABEL.price} ${action.percent > 0 ? '+' : ''}${action.percent}%`
          : ACTION_LABEL.remove
    log('producto', `${label}: ${ids.length} productos`, adminPaths.products)
    toast(`${label}: ${ids.length} productos (solo en pantalla)`, {
      action: {
        label: 'Deshacer',
        onClick: () => {
          setEdits(before)
          toast('Cambio deshecho')
        },
      },
    })
  }

  const exportCsv = (rows: Product[], filename: string) => {
    downloadBlob(
      toCsv([
        ['SKU', 'Producto', 'Marca', 'Categoría', 'Precio', 'Stock', 'Estado'],
        ...rows.map((p) => [
          p.sku,
          p.name,
          p.brand,
          getCategory(p.categoryId)?.name ?? '',
          p.price,
          p.stock,
          p.status === 'borrador' ? 'Borrador' : 'Activo',
        ]),
      ]),
      filename,
      CSV_MIME,
    )
    log('exportacion', `Exportó ${rows.length} productos a CSV`)
  }

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Producto',
      mobileLabel: false,
      sortValue: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-control border border-light">
            <ProductImage alt="" icon={getCategory(p.categoryId)?.icon} tint={p.colors[0]?.hex} />
          </div>
          <div className="min-w-0">
            <Link
              to={adminPaths.product(p.id)}
              className="block max-w-[260px] truncate font-semibold text-text hover:text-primary"
            >
              {p.name}
            </Link>
            <div className="text-xs text-subtle">
              {p.sku} · {p.brand}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      sortValue: (p) => getCategory(p.categoryId)?.name ?? '',
      cell: (p) => <span className="text-muted">{getCategory(p.categoryId)?.name}</span>,
    },
    {
      key: 'price',
      header: 'Precio',
      sortValue: (p) => p.price,
      cell: (p) => <span className="font-semibold whitespace-nowrap">{price(p.price)}</span>,
    },
    { key: 'stock', header: 'Stock', sortValue: (p) => p.stock, cell: (p) => p.stock },
    {
      key: 'colors',
      header: 'Colores',
      cell: (p) => (
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
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortValue: (p) => (p.status === 'borrador' ? 'c' : p.stock === 0 ? 'b' : 'a'),
      cell: (p) => (
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
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      mobileLabel: false,
      cell: (p) => (
        <span className="flex justify-end gap-1">
          <Link
            to={adminPaths.product(p.id)}
            aria-label={`Editar ${p.name}`}
            className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark"
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={notice}
            aria-label={`Eliminar ${p.name}`}
            className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description={`${all.length} productos en el catálogo. Importá y exportá en Excel; la edición es de muestra.`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv(filtered, 'productos-filtrados.csv')}
            >
              <Download size={16} aria-hidden="true" />
              Exportar lista (CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={exportCatalog}>
              <Download size={16} aria-hidden="true" />
              Exportar catálogo
            </Button>
            <Link to={adminPaths.import} className={buttonClasses('outline', 'sm')}>
              <FileSpreadsheet size={16} aria-hidden="true" />
              Importar
            </Link>
            <Link to={adminPaths.productNew} className={buttonClasses('primary', 'sm')}>
              <Plus size={16} aria-hidden="true" />
              Nuevo producto
            </Link>
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
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, marca o SKU"
            className="w-full rounded-control border border-light bg-white py-2.5 pr-3 pl-9 text-[13.5px]"
          />
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <span className="text-muted">Categoría:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-control border border-light bg-white px-3 py-2.5 font-semibold"
          >
            <option value="">Todas</option>
            {getCategories().map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div role="group" aria-label="Filtrar por estado" className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={status === f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold ${status === f.value ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(p) => p.id}
        caption="Productos del catálogo"
        noun="productos"
        selectable
        bulkActions={(ids, clear) => {
          const btn =
            'rounded-control border border-subtle bg-white px-3 py-1 text-[12.5px] font-semibold hover:bg-bg'
          const byId = new Set(ids)
          return (
            <span className="flex flex-wrap gap-2">
              <button
                type="button"
                className={btn}
                onClick={() => run(ids, { kind: 'status', status: 'activo' }, clear)}
              >
                Activar
              </button>
              <button
                type="button"
                className={btn}
                onClick={() => run(ids, { kind: 'status', status: 'borrador' }, clear)}
              >
                Pasar a borrador
              </button>
              <button
                type="button"
                className={btn}
                onClick={() => setPending({ ids, clear, kind: 'price' })}
              >
                Cambiar precio (%)
              </button>
              <button
                type="button"
                className={btn}
                onClick={() =>
                  exportCsv(
                    all.filter((p) => byId.has(p.id)),
                    'productos-seleccion.csv',
                  )
                }
              >
                Exportar selección
              </button>
              <button
                type="button"
                className={btn}
                onClick={() => setPending({ ids, clear, kind: 'remove' })}
              >
                Eliminar
              </button>
            </span>
          )
        }}
        empty={
          <EmptyState
            icon={<Search size={26} aria-hidden="true" />}
            title="Ningún producto coincide"
          >
            Probá con otra búsqueda o cambiá los filtros.
          </EmptyState>
        }
      />

      <ConfirmDialog
        open={pending?.kind === 'price'}
        title="Cambiar precio en lote"
        confirmLabel="Aplicar"
        confirmDisabled={!percent.ok}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending && percent.ok)
            run(pending.ids, { kind: 'price', percent: percent.value }, pending.clear)
          setPending(null)
        }}
      >
        <p className="mt-0">
          Se aplica a {pending?.ids.length} productos. Usá un número negativo para bajar el precio.
        </p>
        <label className="block text-[13px] font-semibold">
          Porcentaje (%)
          <input
            type="text"
            inputMode="numeric"
            value={percentText}
            onChange={(e) => setPercentText(e.target.value)}
            aria-invalid={!percent.ok}
            className="mt-1 block w-full rounded-control border border-light bg-white px-3 py-2"
          />
        </label>
        {!percent.ok && (
          <p role="alert" className="mt-1 mb-0 text-[12.5px] text-red-700">
            {percent.error}
          </p>
        )}
      </ConfirmDialog>
      <ConfirmDialog
        open={pending?.kind === 'remove'}
        title="Eliminar productos"
        confirmLabel="Eliminar"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) run(pending.ids, { kind: 'remove' }, pending.clear)
          setPending(null)
        }}
      >
        Se quitan {pending?.ids.length} productos de la lista (solo en pantalla; podés deshacerlo).
      </ConfirmDialog>
    </>
  )
}
