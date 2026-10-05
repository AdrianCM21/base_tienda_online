import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { rowId } from '@/utils/productDraft'
import { Card } from './Card'
import type { TabProps } from './types'

const cell = 'w-full rounded-control border border-light bg-white px-2.5 py-2 text-[13px]'

export function SpecsTab({ draft, set }: TabProps) {
  const setRow = (id: string, patch: Partial<(typeof draft.specs)[number]>) =>
    set(
      'specs',
      draft.specs.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  return (
    <Card
      title="Especificaciones"
      hint="Datos técnicos que se muestran en la ficha. Marcá “Filtro” para ofrecerlos como filtro en el listado de la categoría. Sirven para cualquier rubro: potencia, material, composición, medidas…"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[13px]">
          <caption className="sr-only">Especificaciones del producto</caption>
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className="px-2 py-2 font-semibold">
                Atributo
              </th>
              <th scope="col" className="px-2 py-2 font-semibold">
                Valor
              </th>
              <th scope="col" className="px-2 py-2 font-semibold">
                Filtro
              </th>
              <th scope="col" className="px-2 py-2">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {draft.specs.map((s) => (
              <tr key={s.id} className="border-t border-light">
                <td className="px-2 py-2">
                  <input
                    aria-label="Atributo"
                    className={cell}
                    value={s.key}
                    onChange={(e) => setRow(s.id, { key: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    aria-label={`Valor de ${s.key || 'la especificación'}`}
                    className={cell}
                    value={s.value}
                    onChange={(e) => setRow(s.id, { value: e.target.value })}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label={`Usar ${s.key || 'la especificación'} como filtro`}
                    className="h-4 w-4 accent-primary"
                    checked={s.filterable}
                    onChange={(e) => setRow(s.id, { filterable: e.target.checked })}
                  />
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    type="button"
                    aria-label={`Quitar ${s.key || 'la especificación'}`}
                    onClick={() =>
                      set(
                        'specs',
                        draft.specs.filter((x) => x.id !== s.id),
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
      {draft.specs.length === 0 && (
        <p className="mt-3 mb-0 text-[13px] text-muted">Todavía no hay especificaciones.</p>
      )}
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() =>
          set('specs', [...draft.specs, { id: rowId(), key: '', value: '', filterable: false }])
        }
      >
        <Plus size={16} aria-hidden="true" />
        Agregar especificación
      </Button>
    </Card>
  )
}
