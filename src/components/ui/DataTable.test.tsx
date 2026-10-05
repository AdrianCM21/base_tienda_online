import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo, useState } from 'react'
import { DataTable, type Column } from './DataTable'

type Row = { id: string; name: string; qty: number }
const ROWS: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Item ${25 - i}`,
  qty: (i * 7) % 11,
}))

const columns: Column<Row>[] = [
  {
    key: 'name',
    header: 'Nombre',
    mobileLabel: false,
    sortValue: (r) => r.name,
    cell: (r) => r.name,
  },
  { key: 'qty', header: 'Cantidad', sortValue: (r) => r.qty, cell: (r) => r.qty },
  { key: 'note', header: 'Nota', cell: () => '—' },
]

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => within(r).getAllByRole('cell').at(-3)!.textContent)

function Harness({ selectable = false }: { selectable?: boolean }) {
  const [q, setQ] = useState('')
  const rows = useMemo(() => ROWS.filter((r) => r.name.includes(q)), [q])
  return (
    <>
      <input aria-label="filtro" value={q} onChange={(e) => setQ(e.target.value)} />
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Items"
        noun="items"
        selectable={selectable}
        bulkActions={(ids) => <button type="button">Acción ({ids.length})</button>}
        empty={<p>Vacío</p>}
      />
    </>
  )
}

describe('DataTable', () => {
  it('pagina de a 10 y muestra el contador', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByText('Mostrando 1-10 de 25 items')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(screen.getByText('Mostrando 21-25 de 25 items')).toBeInTheDocument()
  })

  it('ordena por columna: asc, desc y vuelve al orden original; informa aria-sort', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const head = screen.getByRole('columnheader', { name: /Nombre/ })
    expect(head).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: 'Nota' })).not.toHaveAttribute('aria-sort')
    expect(names()[0]).toBe('Item 25')

    await user.click(within(head).getByRole('button'))
    expect(head).toHaveAttribute('aria-sort', 'ascending')
    expect(names()[0]).toBe('Item 1')

    await user.click(within(head).getByRole('button'))
    expect(head).toHaveAttribute('aria-sort', 'descending')
    expect(names()[0]).toBe('Item 25') // natural descendente: 25 > 9 (no se ordena como texto)

    await user.click(within(head).getByRole('button'))
    expect(head).toHaveAttribute('aria-sort', 'none')
    expect(names()[0]).toBe('Item 25')
  })

  it('ordena números como números', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(
      within(screen.getByRole('columnheader', { name: /Cantidad/ })).getByRole('button'),
    )
    const qty = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => Number(within(r).getAllByRole('cell').at(-2)!.textContent))
    expect(qty).toEqual([...qty].sort((a, b) => a - b))
  })

  it('selección real sobre filas visibles', async () => {
    const user = userEvent.setup()
    render(<Harness selectable />)
    const all = screen.getByRole('checkbox', {
      name: 'Seleccionar todos los de esta página',
    }) as HTMLInputElement
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar r1' }))
    expect(all.indeterminate).toBe(true)
    expect(screen.getByRole('region', { name: 'Acciones en lote' })).toHaveTextContent(
      '1 seleccionado',
    )

    await user.click(all)
    expect(all.checked).toBe(true)
    expect(screen.getByRole('button', { name: 'Acción (10)' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }))
    expect(screen.queryByRole('region', { name: 'Acciones en lote' })).not.toBeInTheDocument()
  })

  it('al filtrar vuelve a la página 1 y limpia la selección', async () => {
    const user = userEvent.setup()
    render(<Harness selectable />)
    await user.click(screen.getByRole('button', { name: 'Página 2' }))
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    await user.type(screen.getByLabelText('filtro'), 'Item 1')
    expect(screen.getByText(/^Mostrando 1-/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Acciones en lote' })).not.toBeInTheDocument()
  })

  it('sin filas muestra el contenido vacío', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByLabelText('filtro'), 'zzz')
    expect(screen.getByText('Vacío')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('cada celda lleva su etiqueta para la vista de tarjetas (móvil)', () => {
    render(<Harness />)
    const cells = within(screen.getAllByRole('row')[1]).getAllByRole('cell')
    expect(cells[0]).not.toHaveAttribute('data-label') // la primera columna no lleva etiqueta
    expect(cells[1]).toHaveAttribute('data-label', 'Cantidad')
    expect(cells[2]).toHaveAttribute('data-label', 'Nota')
  })
})
