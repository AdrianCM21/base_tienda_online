import { useState, type ReactNode } from 'react'
import type { Facets, ProductFilters } from '@/types/catalog'
import { clearFilters } from '@/utils/filterChips'
import { formatNumber } from '@/utils/format'
import { Button } from '../ui/Button'
import { PriceRangeSlider } from '../ui/PriceRangeSlider'
import { CategoryList } from './CategoryList'

const STEP = 10_000
const floorStep = (n: number) => Math.floor(n / STEP) * STEP
const ceilStep = (n: number) => Math.ceil(n / STEP) * STEP
const digits = (s: string) => s.replace(/\D/g, '')

type Props = {
  /** Filtros aplicados actualmente (la sidebar edita una copia hasta "Aplicar filtros"). */
  filters: ProductFilters
  facets: Facets
  activeCategory?: string
  onApply: (filters: ProductFilters) => void
  /** Se llama tras aplicar o limpiar (p. ej. para cerrar el drawer). */
  onDone?: () => void
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 mb-4 min-w-0 border-0 border-t border-light p-0 pt-4">
      <legend className="float-left mb-2.5 w-full p-0 text-[13.5px] font-semibold">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  )
}

function Check({
  label,
  checked,
  count,
  swatch,
  onChange,
}: {
  label: string
  checked: boolean
  count?: number
  swatch?: string
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-[13.5px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-primary"
      />
      {swatch && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
          style={{ background: swatch }}
        />
      )}
      {label}
      {count !== undefined && <span className="ml-auto text-subtle">({count})</span>}
    </label>
  )
}

/**
 * Panel de categorías + filtros. Los cambios se acumulan en un borrador local y se envían
 * con "Aplicar filtros"; el padre debe darle `key` para reiniciarlo cuando cambie la URL.
 */
export function FilterSidebar({ filters, facets, activeCategory, onApply, onDone }: Props) {
  const [brands, setBrands] = useState(filters.brands ?? [])
  const [colors, setColors] = useState(filters.colors ?? [])
  const [specs, setSpecs] = useState(filters.specs ?? {})
  const [onlyOffer, setOnlyOffer] = useState(!!filters.onlyOffer)
  const [minText, setMinText] = useState(filters.priceMin?.toString() ?? '')
  const [maxText, setMaxText] = useState(filters.priceMax?.toString() ?? '')

  const bounds = { min: floorStep(facets.priceRange.min), max: ceilStep(facets.priceRange.max) }
  const hasRange = bounds.max > bounds.min
  const clamp = (n: number) => Math.min(Math.max(n, bounds.min), bounds.max)
  const low = clamp(minText ? Number(minText) : bounds.min)
  const high = clamp(maxText ? Number(maxText) : bounds.max)

  const apply = () => {
    let min = minText ? Number(minText) : undefined
    let max = maxText ? Number(maxText) : undefined
    if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min]
    const next: ProductFilters = { ...(filters.q ? { q: filters.q } : {}) }
    if (brands.length) next.brands = brands
    if (colors.length) next.colors = colors
    const activeSpecs = Object.fromEntries(Object.entries(specs).filter(([, v]) => v.length))
    if (Object.keys(activeSpecs).length) next.specs = activeSpecs
    if (min !== undefined) next.priceMin = min
    if (max !== undefined) next.priceMax = max
    if (onlyOffer) next.onlyOffer = true
    onApply(next)
    onDone?.()
  }

  const clear = () => {
    onApply(clearFilters(filters))
    onDone?.()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        apply()
      }}
    >
      <CategoryList activeSlug={activeCategory} />

      <div className="mb-[18px] flex items-center justify-between border-t border-light pt-4">
        <h2 className="m-0 font-sans text-[15px] font-bold">Filtros</h2>
        <button
          type="button"
          onClick={clear}
          className="text-[12.5px] text-primary hover:text-dark"
        >
          Limpiar
        </button>
      </div>

      {facets.brands.length > 0 && (
        <Group title="Marca">
          {facets.brands.map((b) => (
            <Check
              key={b.value}
              label={b.value}
              count={b.count}
              checked={brands.includes(b.value)}
              onChange={() => setBrands(toggle(brands, b.value))}
            />
          ))}
        </Group>
      )}

      {hasRange && (
        <Group title="Precio (Gs.)">
          <div className="flex gap-2">
            {(
              [
                ['Desde', minText, setMinText],
                ['Hasta', maxText, setMaxText],
              ] as const
            ).map(([label, value, set]) => (
              <input
                key={label}
                inputMode="numeric"
                aria-label={`Precio ${label.toLowerCase()}`}
                placeholder={label}
                value={value ? formatNumber(Number(value)) : ''}
                onChange={(e) => set(digits(e.target.value))}
                className="w-full min-w-0 rounded-control border border-light px-2.5 py-2 text-[12.5px]"
              />
            ))}
          </div>
          <PriceRangeSlider
            min={bounds.min}
            max={bounds.max}
            step={STEP}
            low={low}
            high={high}
            onChange={(l, h) => {
              setMinText(l <= bounds.min ? '' : String(l))
              setMaxText(h >= bounds.max ? '' : String(h))
            }}
          />
        </Group>
      )}

      {facets.colors.length > 0 && (
        <Group title="Color">
          {facets.colors.map((c) => (
            <Check
              key={c.value}
              label={c.value}
              swatch={c.hex}
              count={c.count}
              checked={colors.includes(c.value)}
              onChange={() => setColors(toggle(colors, c.value))}
            />
          ))}
        </Group>
      )}

      {Object.entries(facets.specs).map(([key, list]) => (
        <Group key={key} title={key}>
          {list.map((f) => (
            <Check
              key={f.value}
              label={f.value}
              count={f.count}
              checked={specs[key]?.includes(f.value) ?? false}
              onChange={() => setSpecs({ ...specs, [key]: toggle(specs[key] ?? [], f.value) })}
            />
          ))}
        </Group>
      ))}

      <Group title="Ofertas">
        <Check
          label="Solo productos en oferta"
          checked={onlyOffer}
          onChange={() => setOnlyOffer(!onlyOffer)}
        />
      </Group>

      <Button type="submit" block className="py-[11px] text-[13.5px]">
        Aplicar filtros
      </Button>
    </form>
  )
}
