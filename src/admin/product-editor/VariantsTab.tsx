import { Plus, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { rowId, SIZE_PRESETS } from '@/utils/productDraft'
import { Card } from './Card'
import type { TabProps } from './types'

const cell = 'w-full rounded-control border border-light bg-white px-2.5 py-2 text-[13px]'
const digits = (s: string) => s.replace(/\D/g, '')

export function VariantsTab({ draft, set }: TabProps) {
  const [customSize, setCustomSize] = useState('')
  const sizeId = useId()
  const types = draft.variantTypes
  const toggleType = (key: keyof typeof types) =>
    set('variantTypes', { ...types, [key]: !types[key] })

  const setColor = (id: string, patch: Partial<(typeof draft.colors)[number]>) =>
    set(
      'colors',
      draft.colors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )
  const toggleSize = (s: string) =>
    set('sizes', draft.sizes.includes(s) ? draft.sizes.filter((x) => x !== s) : [...draft.sizes, s])
  const addCustomSize = () => {
    const s = customSize.trim()
    if (s && !draft.sizes.includes(s)) set('sizes', [...draft.sizes, s])
    setCustomSize('')
  }
  const sizeList = [...new Set([...SIZE_PRESETS, ...draft.sizes])]

  return (
    <>
      <Card
        title="Variantes"
        hint="Para productos que vienen en distintas opciones: color de una remera, talle de un calzado, medida de un tornillo…"
      >
        <Switch
          checked={draft.hasVariants}
          onChange={(v) => set('hasVariants', v)}
          label="Este producto tiene variantes"
        />
        {draft.hasVariants && (
          <fieldset className="m-0 mt-2 flex min-w-0 flex-wrap gap-x-6 gap-y-1 border-0 p-0">
            <legend className="mb-1 float-left w-full text-[12.5px] font-semibold text-muted">
              Opciones que varían
            </legend>
            {(
              [
                ['color', 'Color'],
                ['size', 'Talle'],
                ['measure', 'Medida'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 py-1 text-[13.5px]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={types[key]}
                  onChange={() => toggleType(key)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
      </Card>

      {draft.hasVariants && types.color && (
        <Card
          title="Colores"
          hint="Cada color tiene su propio stock y, si hace falta, un ajuste de precio."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[13px]">
              <caption className="sr-only">Colores del producto</caption>
              <thead>
                <tr className="text-left text-xs text-muted">
                  {['Color', 'Nombre', 'Stock', 'Ajuste de precio (Gs.)', ''].map((h, i) => (
                    <th key={i} scope="col" className="px-2 py-2 font-semibold">
                      {h || <span className="sr-only">Acciones</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.colors.map((c) => (
                  <tr key={c.id} className="border-t border-light">
                    <td className="px-2 py-2">
                      <input
                        type="color"
                        aria-label={`Color de ${c.name || 'la variante'}`}
                        value={c.hex}
                        onChange={(e) => setColor(c.id, { hex: e.target.value.toUpperCase() })}
                        className="h-9 w-12 cursor-pointer rounded-control border border-light bg-white p-0.5"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        aria-label="Nombre del color"
                        className={cell}
                        value={c.name}
                        onChange={(e) => setColor(c.id, { name: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        aria-label={`Stock de ${c.name || 'la variante'}`}
                        inputMode="numeric"
                        className={`${cell} w-24`}
                        value={c.stock}
                        onChange={(e) => setColor(c.id, { stock: digits(e.target.value) })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        aria-label={`Ajuste de precio de ${c.name || 'la variante'}`}
                        inputMode="numeric"
                        className={`${cell} w-36`}
                        placeholder="0"
                        value={c.priceDelta}
                        onChange={(e) => setColor(c.id, { priceDelta: digits(e.target.value) })}
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        aria-label={`Quitar ${c.name || 'la variante'}`}
                        onClick={() =>
                          set(
                            'colors',
                            draft.colors.filter((x) => x.id !== c.id),
                          )
                        }
                        className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {draft.colors.length === 0 && (
            <p className="mt-3 mb-0 text-[13px] text-muted">Todavía no agregaste colores.</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() =>
              set('colors', [
                ...draft.colors,
                { id: rowId(), name: '', hex: '#111827', stock: '0', priceDelta: '' },
              ])
            }
          >
            <Plus size={16} aria-hidden="true" />
            Agregar color
          </Button>
        </Card>
      )}

      {draft.hasVariants && types.size && (
        <Card
          title="Talles"
          hint="Elegí los talles disponibles o agregá los tuyos (calzado, ropa, guantes…)."
        >
          <div role="group" aria-label="Talles disponibles" className="flex flex-wrap gap-2">
            {sizeList.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={draft.sizes.includes(s)}
                onClick={() => toggleSize(s)}
                className={`min-w-11 rounded-control border px-3 py-1.5 text-[13px] font-semibold ${draft.sizes.includes(s) ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex max-w-[360px] items-end gap-2">
            <div className="flex-1">
              <label
                htmlFor={sizeId}
                className="mb-1.5 block text-[12.5px] font-semibold text-muted"
              >
                Otro talle
              </label>
              <input
                id={sizeId}
                className={cell}
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
              />
            </div>
            <Button variant="outline" size="sm" onClick={addCustomSize}>
              Agregar
            </Button>
          </div>
        </Card>
      )}

      {draft.hasVariants && types.measure && (
        <Card title="Medidas" hint='Separadas por coma. Ej.: 1/2", 3/4", 1" o 10 cm, 20 cm, 30 cm.'>
          <label
            htmlFor={`${sizeId}-m`}
            className="mb-1.5 block text-[12.5px] font-semibold text-muted"
          >
            Medidas disponibles
          </label>
          <input
            id={`${sizeId}-m`}
            className={`${cell} max-w-[480px]`}
            value={draft.measures}
            onChange={(e) => set('measures', e.target.value)}
          />
        </Card>
      )}
    </>
  )
}
