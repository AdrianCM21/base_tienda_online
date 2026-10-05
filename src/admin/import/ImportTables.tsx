import { useCurrency } from '@/hooks/useCurrency'
import { getCategory, getSubcategory } from '@/services/catalogService'
import type { ImportPlan, ImportAction } from '@/utils/xlsx/plan'
import type { ImportIssue, ParsedSheet } from '@/utils/xlsx/types'
import { StatusBadge } from '../StatusBadge'

const MAX_ROWS = 100
const th = 'px-3 py-2.5 text-left text-xs font-semibold text-muted'
const td = 'px-3 py-2'

function Wrap({ children, total }: { children: React.ReactNode; total: number }) {
  return (
    <>
      <div className="overflow-x-auto rounded-card border border-light bg-white">{children}</div>
      {total > MAX_ROWS && (
        <p className="mt-2 mb-0 text-xs text-subtle">
          Se muestran las primeras {MAX_ROWS} filas de {total}.
        </p>
      )}
    </>
  )
}

export function IssuesTable({ issues }: { issues: ImportIssue[] }) {
  if (!issues.length)
    return (
      <p className="m-0 text-[13.5px] text-muted">
        No se encontraron problemas. El archivo está listo para importar.
      </p>
    )
  return (
    <Wrap total={issues.length}>
      <table className="w-full min-w-[640px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-light">
            {['Tipo', 'Hoja', 'Fila', 'Columna', 'Detalle'].map((h) => (
              <th key={h} scope="col" className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.slice(0, MAX_ROWS).map((i, k) => (
            <tr key={k} className="border-b border-light last:border-0 align-top">
              <td className={td}>
                <StatusBadge tone={i.severity === 'error' ? 'red' : 'amber'}>
                  {i.severity === 'error' ? 'Error' : 'Aviso'}
                </StatusBadge>
              </td>
              <td className={td}>{i.sheet}</td>
              <td className={td}>{i.row || '—'}</td>
              <td className={`${td} font-mono text-xs`}>{i.column ?? '—'}</td>
              <td className={td}>{i.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Wrap>
  )
}

const ACTION: Record<ImportAction, { label: string; tone: 'green' | 'blue' | 'gray' | 'amber' }> = {
  nuevo: { label: 'Nuevo', tone: 'green' },
  actualizado: { label: 'Actualiza', tone: 'blue' },
  'sin-cambios': { label: 'Sin cambios', tone: 'gray' },
  omitido: { label: 'Se omite', tone: 'amber' },
}

/** Productos válidos del archivo, con la acción que tendría cada uno según el modo de importación. */
export function ProductsPreview({ plan }: { plan: ImportPlan }) {
  const { price } = useCurrency()
  if (!plan.items.length)
    return <p className="m-0 text-[13.5px] text-muted">Ningún producto válido para mostrar.</p>
  return (
    <Wrap total={plan.items.length}>
      <table className="w-full min-w-[820px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-light">
            {['Acción', 'SKU', 'Nombre', 'Marca', 'Categoría', 'Precio', 'Stock', 'Colores'].map(
              (h) => (
                <th key={h} scope="col" className={th}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {plan.items.slice(0, MAX_ROWS).map(({ product: p, action, changes }) => (
            <tr key={p.id} className="border-b border-light last:border-0">
              <td className={td}>
                <StatusBadge tone={ACTION[action].tone}>{ACTION[action].label}</StatusBadge>
                {changes.length > 0 && (
                  <span className="mt-1 block text-xs text-subtle">
                    Cambia: {changes.join(', ')}
                  </span>
                )}
              </td>
              <td className={`${td} font-mono text-xs`}>{p.sku}</td>
              <td className={`${td} font-semibold`}>{p.name}</td>
              <td className={td}>{p.brand}</td>
              <td className={`${td} text-muted`}>
                {getCategory(p.categoryId)?.name ?? p.categoryId} ›{' '}
                {getSubcategory(p.subcategoryId)?.subcategory.name ?? p.subcategoryId}
              </td>
              <td className={`${td} whitespace-nowrap`}>{price(p.price)}</td>
              <td className={td}>{p.stock}</td>
              <td className={td}>
                <span className="flex gap-1">
                  {p.colors.map((c) => (
                    <span
                      key={c.name}
                      title={c.name}
                      className="h-3.5 w-3.5 rounded-full border border-black/15"
                      style={{ background: c.hex }}
                    />
                  ))}
                  {!p.colors.length && '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Wrap>
  )
}

/** Vista de las filas tal como vinieron en la hoja (Variantes / Especificaciones). */
export function RawTable({ sheet }: { sheet?: ParsedSheet }) {
  if (!sheet || !sheet.rows.length)
    return <p className="m-0 text-[13.5px] text-muted">Esta hoja no tiene filas.</p>
  return (
    <Wrap total={sheet.rows.length}>
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-light">
            <th scope="col" className={th}>
              Fila
            </th>
            {sheet.headers.map((h) => (
              <th key={h} scope="col" className={`${th} font-mono`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.rows.slice(0, MAX_ROWS).map((r) => (
            <tr key={r.row} className="border-b border-light last:border-0">
              <td className={`${td} text-subtle`}>{r.row}</td>
              {sheet.headers.map((h) => (
                <td key={h} className={td}>
                  {r.values[h] || <span className="text-subtle">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Wrap>
  )
}
