import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import type { SortKey } from '@/types/catalog'
import { SORT_OPTIONS } from '@/utils/sort'

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (v: SortKey) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-2 text-[13.5px]">
      <label htmlFor={id} className="text-muted">
        Ordenar por:
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
          className="cursor-pointer appearance-none rounded-control border border-light bg-white py-2 pr-8 pl-3 font-semibold text-text"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          strokeWidth={2}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        />
      </div>
    </div>
  )
}
