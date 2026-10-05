import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

/** Variación contra el período anterior: verde si sube, rojo si baja, gris si no hay base. */
export function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
        <Minus size={13} aria-hidden="true" />
        Sin período anterior
      </span>
    )
  }
  const up = value > 0
  const flat = value === 0
  const tone = flat ? 'text-muted' : up ? 'text-emerald-700' : 'text-red-700'
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${tone}`}>
      <Icon size={14} aria-hidden="true" />
      <span
        aria-label={
          flat
            ? 'Sin cambios respecto del período anterior'
            : `${up ? 'Subió' : 'Bajó'} ${Math.abs(value)}% respecto del período anterior`
        }
      >
        {up ? '+' : ''}
        {value}%
      </span>
      <span className="font-normal text-subtle">vs. período anterior</span>
    </span>
  )
}
