type Props = {
  /** Límites absolutos del slider. */
  min: number
  max: number
  step?: number
  /** Valores actuales (ya acotados a [min, max]). */
  low: number
  high: number
  onChange: (low: number, high: number) => void
}

/** Slider de dos extremos (4px de track, thumbs de 14px). */
export function PriceRangeSlider({ min, max, step = 10_000, low, high, onChange }: Props) {
  const span = Math.max(1, max - min)
  const pct = (v: number) => ((v - min) / span) * 100
  return (
    <div className="relative mt-3.5 h-3.5">
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-[4px] bg-light" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-[4px] bg-primary"
        style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
      />
      <input
        type="range"
        className="dual-range"
        aria-label="Precio mínimo"
        min={min}
        max={max}
        step={step}
        value={low}
        onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
      />
      <input
        type="range"
        className="dual-range"
        aria-label="Precio máximo"
        min={min}
        max={max}
        step={step}
        value={high}
        onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
      />
    </div>
  )
}
