import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { paginate } from '@/utils/paginate'
import { compareValues } from '@/utils/sort'
import { Pagination } from './Pagination'

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Si existe, la columna se puede ordenar por este valor. */
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right'
  /** Etiqueta en la vista de tarjetas (móvil). Por defecto el encabezado; `false` = sin etiqueta. */
  mobileLabel?: string | false
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  /** Descripción accesible de la tabla. */
  caption: string
  pageSize?: number
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  /** Muestra casillas de selección y la barra de acciones en lote. */
  selectable?: boolean
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode
  /** Sustantivo en plural para los contadores ("productos", "pedidos"). */
  noun?: string
  empty?: ReactNode
  /** Se llama al hacer clic en una fila (fuera de enlaces, botones y casillas). */
  onRowClick?: (row: T) => void
}

const SELECTABLE = 'a,button,input,label,select,textarea'

/**
 * Tabla de datos del panel: orden por columna, selección múltiple con acciones en lote,
 * paginación y vista de tarjetas por debajo de 700 px (mismo DOM, solo cambia el CSS).
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  pageSize = 10,
  initialSort,
  selectable = false,
  bulkActions,
  noun = 'resultados',
  empty,
  onRowClick,
}: Props<T>) {
  const [sort, setSort] = useState(initialSort ?? null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [prevRows, setPrevRows] = useState(rows)

  // Si cambian las filas (filtros, búsqueda) se vuelve a la primera página y se limpia la selección.
  if (prevRows !== rows) {
    setPrevRows(rows)
    setPage(1)
    setSelected(new Set())
  }

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const get = col.sortValue
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => dir * compareValues(get(a), get(b)))
  }, [rows, columns, sort])

  const view = paginate(sorted, page, pageSize)
  const pageIds = view.items.map(getRowId)
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someOnPage = pageIds.some((id) => selected.has(id))

  const toggleSort = (key: string) =>
    setSort((cur) =>
      cur?.key === key ? (cur.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' },
    )
  const toggleRow = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const togglePage = () =>
    setSelected((cur) => {
      const next = new Set(cur)
      for (const id of pageIds) {
        if (allOnPage) next.delete(id)
        else next.add(id)
      }
      return next
    })
  const clear = () => setSelected(new Set())

  if (rows.length === 0) return <>{empty}</>

  const th = 'px-4 py-3 text-xs font-semibold text-muted'
  return (
    <div>
      {selected.size > 0 && (
        <div
          role="region"
          aria-label="Acciones en lote"
          className="mb-3 flex flex-wrap items-center gap-3 rounded-card bg-light px-4 py-2.5 text-[13px]"
        >
          <strong>
            {selected.size} {selected.size === 1 ? 'seleccionado' : 'seleccionados'}
          </strong>
          {bulkActions?.([...selected], clear)}
          <button
            type="button"
            onClick={clear}
            className="ml-auto font-semibold text-primary hover:text-dark"
          >
            Limpiar selección
          </button>
        </div>
      )}
      <p aria-live="polite" className="mb-2 text-[13px] text-muted">
        Mostrando {view.from}-{view.to} de {view.total} {noun}
      </p>
      <div className="overflow-x-auto rounded-card border border-light bg-white">
        <table className="block w-full border-collapse text-[13px] min-[700px]:table">
          <caption className="sr-only">{caption}</caption>
          <thead className="max-[699px]:sr-only">
            <tr className="border-b border-light text-left">
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los de esta página"
                    className="h-4 w-4 accent-primary"
                    checked={allOnPage}
                    ref={(el) => {
                      if (el) el.indeterminate = !allOnPage && someOnPage
                    }}
                    onChange={togglePage}
                  />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.key === c.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : c.sortValue
                          ? 'none'
                          : undefined
                    }
                    className={`${th} ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 font-semibold hover:text-dark"
                      >
                        {c.header}
                        {active ? (
                          sort.dir === 'asc' ? (
                            <ArrowUp size={13} aria-hidden="true" />
                          ) : (
                            <ArrowDown size={13} aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown size={13} className="text-subtle" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="max-[699px]:block">
            {view.items.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)
              return (
                <tr
                  key={id}
                  data-selected={isSelected || undefined}
                  onClick={
                    onRowClick
                      ? (e) => !(e.target as HTMLElement).closest(SELECTABLE) && onRowClick(row)
                      : undefined
                  }
                  className={`border-b border-light last:border-0 max-[699px]:block max-[699px]:p-3 ${isSelected ? 'bg-light/60' : ''} ${onRowClick ? 'cursor-pointer hover:bg-bg' : ''}`}
                >
                  {selectable && (
                    <td className="w-10 px-4 py-2.5 max-[699px]:block max-[699px]:px-0 max-[699px]:py-1">
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${id}`}
                        className="h-4 w-4 accent-primary"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      data-label={c.mobileLabel === false ? undefined : (c.mobileLabel ?? c.header)}
                      className={`px-4 py-2.5 align-middle max-[699px]:flex max-[699px]:items-center max-[699px]:justify-between max-[699px]:gap-3 max-[699px]:px-0 max-[699px]:py-1 max-[699px]:before:shrink-0 max-[699px]:before:text-xs max-[699px]:before:font-semibold max-[699px]:before:text-muted max-[699px]:before:content-[attr(data-label)] ${c.align === 'right' ? 'text-right max-[699px]:text-left' : ''} ${c.mobileLabel === false ? (c.align === 'right' ? 'max-[699px]:justify-end' : 'max-[699px]:justify-start') : ''}`}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={view.page} pageCount={view.pageCount} onPageChange={setPage} />
    </div>
  )
}
