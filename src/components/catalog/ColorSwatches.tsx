import type { ColorVariant } from '@/types/product'

type Props = {
  colors: ColorVariant[]
  selected: number
  onSelect: (index: number) => void
  /** Cantidad máxima de swatches visibles; el resto se resume en "+N". */
  max?: number
  size?: 'sm' | 'md'
  /** Cambia la selección al pasar el mouse o enfocar (tarjetas). En el detalle solo con click. */
  selectOnHover?: boolean
  className?: string
}

/** Círculos de color. Los colores sin stock se muestran tachados pero siguen siendo elegibles (informativo). */
export function ColorSwatches({
  colors,
  selected,
  onSelect,
  max = 4,
  size = 'sm',
  selectOnHover = true,
  className = '',
}: Props) {
  // Si el seleccionado queda fuera de los visibles, se muestra igual.
  const visible = colors.map((c, i) => ({ c, i })).filter(({ i }) => i < max || i === selected)
  const hidden = colors.length - visible.length
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-7 w-7'
  return (
    <div
      role="group"
      aria-label="Colores disponibles"
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
    >
      {visible.map(({ c, i }) => (
        <button
          key={c.name}
          type="button"
          aria-label={`Color ${c.name}${c.stock <= 0 ? ' (sin stock)' : ''}`}
          aria-pressed={i === selected}
          title={c.name}
          onMouseEnter={selectOnHover ? () => onSelect(i) : undefined}
          onFocus={selectOnHover ? () => onSelect(i) : undefined}
          onClick={() => onSelect(i)}
          className={`relative ${dim} shrink-0 rounded-full border border-black/15 transition-shadow ${
            i === selected ? 'shadow-[0_0_0_2px_#fff,0_0_0_3.5px_var(--color-primary)]' : ''
          }`}
          style={{ background: c.hex }}
        >
          {c.stock <= 0 && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'linear-gradient(135deg, transparent 46%, rgba(220,38,38,0.9) 48%, rgba(220,38,38,0.9) 52%, transparent 54%)',
              }}
            />
          )}
        </button>
      ))}
      {hidden > 0 && <span className="text-[11.5px] font-semibold text-subtle">+{hidden}</span>}
    </div>
  )
}
