import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/App'
import { renderWithProviders } from '@/test/renderWithProviders'
import { downloadBlob } from '@/utils/download'
import { readActivity } from '@/utils/activityLog'

vi.mock('@/utils/download', () => ({ downloadBlob: vi.fn() }))

const open = (path: string) => {
  window.localStorage.setItem('tienda-demo:admin-session', 'true')
  return renderWithProviders(<AppRoutes />, path)
}
const h1 = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 8000 })

afterEach(() => vi.clearAllMocks())

describe('Etapa D: lotes, exportaciones y actividad', () => {
  it('productos: pasar a borrador, registrar y deshacer', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    const bar = screen.getByRole('region', { name: 'Acciones en lote' })
    await user.click(within(bar).getByRole('button', { name: 'Pasar a borrador' }))
    expect(screen.getAllByText(/Pasar a borrador: 10 productos/).length).toBeGreaterThan(0)
    expect(readActivity().some((e) => e.message.includes('Pasar a borrador: 10'))).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(screen.getAllByText('Cambio deshecho').length).toBeGreaterThan(0)
  })

  it('productos: el cambio de precio valida el porcentaje', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    await user.click(screen.getByRole('button', { name: 'Cambiar precio (%)' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Cambiar precio en lote' })
    const input = within(dialog).getByLabelText('Porcentaje (%)')
    await user.clear(input)
    await user.type(input, '500')
    expect(within(dialog).getByRole('alert')).toHaveTextContent('entre -90%')
    expect(within(dialog).getByRole('button', { name: 'Aplicar' })).toBeDisabled()
    await user.clear(input)
    await user.type(input, '-10')
    await user.click(within(dialog).getByRole('button', { name: 'Aplicar' }))
    expect(screen.getAllByText(/Cambiar precio -10%: 10 productos/).length).toBeGreaterThan(0)
  })

  it('productos: exporta la selección y la lista a CSV', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    await user.click(screen.getByRole('button', { name: /Exportar lista/ }))
    expect(vi.mocked(downloadBlob).mock.calls[0][1]).toBe('productos-filtrados.csv')
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    await user.click(screen.getByRole('button', { name: 'Exportar selección' }))
    expect(vi.mocked(downloadBlob).mock.calls[1][1]).toBe('productos-seleccion.csv')
  })

  it('pedidos: pasa varios a "Confirmado" en lote', async () => {
    const user = userEvent.setup()
    open('/admin/pedidos')
    await h1('Pedidos')
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    const bar = screen.getByRole('region', { name: 'Acciones en lote' })
    await user.click(within(bar).getByRole('button', { name: 'Marcar confirmado' }))
    expect(screen.getAllByText(/pasaron a «Confirmado»/).length).toBeGreaterThan(0)
  })
})

describe('Etapa D: exportaciones adicionales', () => {
  it.each([
    ['/admin/marketing/cupones', 'Cupones', 'cupones.csv', 'Exportar CSV'],
    ['/admin/categorias', 'Categorías', 'categorias.csv', 'Exportar CSV'],
    ['/admin', 'Inicio', 'resumen-ultimos-30-dias.csv', 'Exportar resumen'],
  ])('%s descarga %s', async (path, title, file, button) => {
    const user = userEvent.setup()
    open(path)
    await h1(title)
    await user.click(screen.getByRole('button', { name: button }))
    expect(vi.mocked(downloadBlob).mock.calls[0][1]).toBe(file)
  })
})
