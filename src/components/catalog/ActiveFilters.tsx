import { X } from 'lucide-react'
import type { ProductFilters } from '@/types/catalog'
import { clearFilters, filterChips } from '@/utils/filterChips'

type Props = { filters: ProductFilters; onChange: (f: ProductFilters) => void }

/** Chips de los filtros activos, cada uno removible. */
export function ActiveFilters({ filters, onChange }: Props) {
  const chips = filterChips(filters)
  if (!chips.length) return null
  return (
    <ul
      aria-label="Filtros activos"
      className="m-0 mb-4 flex list-none flex-wrap items-center gap-2 p-0"
    >
      {chips.map((c) => (
        <li key={c.key}>
          <button
            type="button"
            onClick={() => onChange(c.without)}
            aria-label={`Quitar filtro ${c.label}`}
            className="inline-flex items-center gap-1.5 rounded-pill bg-light px-3 py-1 text-[12.5px] font-semibold text-dark hover:bg-primary hover:text-white"
          >
            {c.label}
            <X size={12} aria-hidden="true" />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => onChange(clearFilters(filters))}
          className="text-[12.5px] font-semibold text-primary hover:text-dark"
        >
          Limpiar todo
        </button>
      </li>
    </ul>
  )
}
