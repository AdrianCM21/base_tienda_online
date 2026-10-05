import { Boxes, Download, PackageX, Search, TriangleAlert, Wallet } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/useToast'
import { getAllProductsIncludingDrafts, getCategories } from '@/services/catalogService'
import { toCsv } from '@/utils/adminExport'
import { downloadBlob } from '@/utils/download'
import { formatNumber } from '@/utils/format'
import {
  buildInventoryRows,
  summarizeInventory,
  type InventoryRow,
  type StockStatus,
} from '@/utils/inventory'
import { filterProducts } from '@/utils/filters'
import { AdminPageHeader } from './AdminPageHeader'
import { StatCard } from './StatCard'
import { StatusBadge } from './StatusBadge'

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'agotado', label: 'Agotados' },
  { value: 'bajo', label: 'Stock bajo' },
  { value: 'ok', label: 'Disponibles' },
] as const
type Filter = (typeof FILTERS)[number]['value']
const STATUS: Record<StockStatus, { label: string; tone: 'red' | 'amber' | 'green' }> = {
  agotado: { label: 'Agotado', tone: 'red' },
  bajo: { label: 'Stock bajo', tone: 'amber' },
  ok: { label: 'Disponible', tone: 'green' },
}
const BAR: Record<StockStatus, string> = {
  agotado: 'bg-red-600',
  bajo: 'bg-amber-500',
  ok: 'bg-emerald-600',
}
const initialFilter = (v: string | null): Filter =>
  FILTERS.some((f) => f.value === v) ? (v as Filter) : 'todos'

export default function InventoryPage() {
  const { price } = useCurrency()
  const { toast } = useToast()
  const [params] = useSearchParams()
  const [threshold, setThreshold] = useState(5)
  const [filter, setFilter] = useState<Filter>(() => initialFilter(params.get('estado')))
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const thresholdId = useId()

  const products = useMemo(() => getAllProductsIncludingDrafts(), [])
  const all = useMemo(() => buildInventoryRows(products, threshold), [products, threshold])
  const summary = useMemo(() => summarizeInventory(all), [all])
  const rows = useMemo(() => {
    const matching = q.trim() ? new Set(filterProducts(products, { q }).map((p) => p.id)) : null
    return all.filter(
      (r) =>
        (filter === 'todos' || r.status === filter) &&
        (!category || r.categoryId === category) &&
        (!matching || matching.has(r.productId)),
    )
  }, [all, filter, category, q, products])

  const exportCsv = () =>
    downloadBlob(
      toCsv([
        ['Producto', 'Variante', 'SKU', 'Stock', 'Estado', 'Valor del stock (Gs.)'],
        ...rows.map((r) => [
          r.name,
          r.variant?.name ?? '',
          r.sku,
          r.stock,
          STATUS[r.status].label,
          r.value,
        ]),
      ]),
      'inventario.csv',
      'text/csv;charset=utf-8',
    )

  const columns: Column<InventoryRow>[] = [
    {
      key: 'name',
      header: 'Producto',
      mobileLabel: false,
      sortValue: (r) => r.name,
      cell: (r) => (
        <div className="min-w-0">
          <span className="block max-w-[300px] truncate font-semibold">{r.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-subtle">
            {r.variant && (
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ background: r.variant.hex }}
              />
            )}
            {r.variant ? `${r.variant.name} · ` : ''}
            {r.sku}
          </span>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortValue: (r) => r.stock,
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          <span className="w-8 font-semibold">{r.stock}</span>
          <span aria-hidden="true" className="h-1.5 w-24 overflow-hidden rounded-full bg-light">
            <span
              className={`block h-full rounded-full ${BAR[r.status]}`}
              style={{ width: `${Math.min(100, (r.stock / Math.max(1, threshold * 4)) * 100)}%` }}
            />
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortValue: (r) => ['agotado', 'bajo', 'ok'].indexOf(r.status),
      cell: (r) => <StatusBadge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</StatusBadge>,
    },
    {
      key: 'value',
      header: 'Valor del stock',
      sortValue: (r) => r.value,
      cell: (r) => <span className="whitespace-nowrap">{price(r.value)}</span>,
    },
    {
      key: 'action',
      header: 'Acción',
      align: 'right',
      mobileLabel: false,
      cell: (r) => (
        <button
          type="button"
          onClick={() => toast('Reponer stock no está disponible en la demo')}
          disabled={r.status === 'ok'}
          aria-label={`Reponer ${r.name}${r.variant ? ` ${r.variant.name}` : ''}`}
          className="rounded-control border border-subtle bg-white px-3 py-1 text-[12.5px] font-semibold hover:bg-bg disabled:opacity-40 disabled:hover:bg-white"
        >
          Reponer
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Inventario"
        description="Stock por producto y por variante (color). Elegí a partir de cuántas unidades se avisa de stock bajo."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" />
            Exportar CSV
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
        <StatCard
          label="Unidades en stock"
          value={formatNumber(summary.units)}
          hint={`${summary.items} ítems`}
          icon={<Boxes size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Valor del inventario"
          value={price(summary.value)}
          hint="A precio de venta"
          icon={<Wallet size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Agotados"
          value={formatNumber(summary.outOfStock)}
          icon={<PackageX size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Stock bajo"
          value={formatNumber(summary.low)}
          hint={`Hasta ${threshold} unidades`}
          icon={<TriangleAlert size={16} aria-hidden="true" />}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Buscar en el inventario</span>
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
        <label htmlFor={thresholdId} className="flex items-center gap-2 text-[13px]">
          <span className="text-muted">Avisar con menos de</span>
          <input
            id={thresholdId}
            type="number"
            min={0}
            max={200}
            value={threshold}
            onChange={(e) => setThreshold(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
            className="w-20 rounded-control border border-light bg-white px-3 py-2.5 font-semibold"
          />
          <span className="text-muted">unidades</span>
        </label>
      </div>
      <div
        role="group"
        aria-label="Filtrar por estado del stock"
        className="mb-4 flex flex-wrap gap-1.5"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold ${filter === f.value ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Inventario por producto y variante"
        noun="ítems"
        initialSort={{ key: 'stock', dir: 'asc' }}
        empty={
          <EmptyState icon={<Search size={26} aria-hidden="true" />} title="Ningún ítem coincide">
            Probá con otra búsqueda o cambiá los filtros.
          </EmptyState>
        }
      />
    </>
  )
}
