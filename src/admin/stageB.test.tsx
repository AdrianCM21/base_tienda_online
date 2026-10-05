import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/App'
import { getAllProductsIncludingDrafts, getProductById } from '@/services/catalogService'
import { sampleCartItems } from '@/services/demoService'
import { renderWithProviders } from '@/test/renderWithProviders'
import { hydrate } from '@/utils/cart'
import { buildDemoOrder } from '@/utils/demoOrder'
import { downloadBlob } from '@/utils/download'
import { buildInventoryRows, summarizeInventory } from '@/utils/inventory'
import { saveOrder } from '@/utils/orders'

vi.mock('@/utils/download', () => ({ downloadBlob: vi.fn() }))

const open = (path: string) => {
  window.localStorage.setItem('tienda-demo:admin-session', 'true')
  return renderWithProviders(<AppRoutes />, path)
}
const h1 = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 8000 })
const csvArg = () => String(vi.mocked(downloadBlob).mock.calls.at(-1)![0])
const fileArg = () => vi.mocked(downloadBlob).mock.calls.at(-1)![1]

afterEach(() => vi.clearAllMocks())

describe('inicio v2', () => {
  it('muestra KPIs con variación contra el período anterior y el gráfico de 30 días', async () => {
    open('/admin')
    await h1('Inicio')
    const main = within(screen.getByRole('main'))
    for (const k of ['Ventas', 'Pedidos', 'Ticket promedio', 'Productos activos'])
      expect(main.getAllByText(k).length).toBeGreaterThan(0)
    expect(screen.getByRole('img', { name: 'Ventas de los últimos 30 días' })).toBeInTheDocument()
    expect(main.getAllByText('vs. período anterior').length).toBeGreaterThanOrEqual(3)
    expect(
      main.getAllByLabelText(/(Subió|Bajó) \d+% respecto del período anterior|Sin cambios/).length,
    ).toBeGreaterThan(0)
  })

  it('el selector de período actualiza el gráfico y los totales', async () => {
    const user = userEvent.setup()
    open('/admin')
    await h1('Inicio')
    const before = screen.getByText(/en \d+ pedidos/).textContent
    await user.click(screen.getByRole('radio', { name: '7 días' }))
    expect(screen.getByRole('img', { name: 'Ventas de los últimos 7 días' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Ventas de los últimos 7 días' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/en \d+ pedidos/).textContent).not.toBe(before)
  })

  it('"Por hacer" cuenta tareas y enlaza a la lista ya filtrada', async () => {
    open('/admin')
    await h1('Inicio')
    const todo = within(screen.getByRole('region', { name: 'Por hacer' }) ?? document.body)
    expect(todo.getByRole('link', { name: /Pedidos pendientes de pago/ })).toHaveAttribute(
      'href',
      '/admin/pedidos?estado=pendiente',
    )
    expect(todo.getByRole('link', { name: /Productos sin stock/ })).toHaveAttribute(
      'href',
      '/admin/inventario?estado=agotado',
    )
    expect(todo.getByRole('link', { name: /Productos con stock bajo/ })).toHaveAttribute(
      'href',
      '/admin/inventario?estado=bajo',
    )
    expect(todo.getByRole('link', { name: /Borradores sin publicar/ })).toHaveAttribute(
      'href',
      '/admin/productos?filtro=borrador',
    )
    expect(todo.getByRole('link', { name: /Borradores sin publicar/ })).toHaveTextContent('1')
  })

  it('ventas por categoría y por medio de pago con participación', async () => {
    open('/admin')
    await h1('Inicio')
    const cat = within(screen.getByRole('region', { name: 'Ventas por categoría' }))
    expect(cat.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3)
    expect(cat.getAllByText(/\d+%/).length).toBeGreaterThan(0)
    const pay = within(screen.getByRole('region', { name: 'Ventas por medio de pago' }))
    expect(pay.getByText('Tarjeta')).toBeInTheDocument()
    expect(pay.getByText('Efectivo')).toBeInTheDocument()
  })

  it('stock bajo muestra variantes (color) y enlaza al inventario', async () => {
    open('/admin')
    await h1('Inicio')
    const low = within(screen.getByRole('region', { name: 'Stock bajo' }))
    expect(low.getAllByRole('listitem').length).toBeGreaterThan(0)
    expect(low.getByRole('link', { name: 'Ver inventario →' })).toHaveAttribute(
      'href',
      '/admin/inventario',
    )
  })
})

describe('filtros iniciales por enlace', () => {
  it('pedidos ?estado= abre la lista filtrada', async () => {
    open('/admin/pedidos?estado=pendiente')
    await h1('Pedidos')
    expect(
      screen.getByRole('button', { name: /^Pendiente de pago/, pressed: true }),
    ).toBeInTheDocument()
    for (const r of screen.getAllByRole('row').slice(1))
      expect(within(r).getByText('Pendiente de pago')).toBeInTheDocument()
  })
  it('productos ?filtro= abre la lista filtrada', async () => {
    open('/admin/productos?filtro=borrador')
    await h1('Productos')
    expect(screen.getByRole('button', { name: 'Borradores', pressed: true })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })
})

describe('reportes', () => {
  it('ventas: totales, tabla diaria y exportación', async () => {
    const user = userEvent.setup()
    open('/admin/reportes')
    await h1('Reportes')
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Ventas',
      'Productos',
      'Categorías y pagos',
    ])
    expect(screen.getByText(/Mostrando 1-10 de 30 días/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '14 días' }))
    expect(screen.getByText(/Mostrando 1-10 de 14 días/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(fileArg()).toBe('ventas-por-dia-ultimos-14-dias.csv')
    const lines = csvArg().split('\r\n')
    expect(lines[0]).toContain('"Fecha","Pedidos","Ventas (Gs.)"')
    expect(lines).toHaveLength(15)
  })

  it('productos: ranking ordenable y exportable', async () => {
    const user = userEvent.setup()
    open('/admin/reportes')
    await h1('Reportes')
    await user.click(screen.getByRole('tab', { name: 'Productos' }))
    expect(screen.getByRole('table', { name: 'Ranking de productos' })).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('columnheader', { name: /Ingresos/ })).getByRole('button'),
    )
    const rev = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => Number(within(r).getAllByRole('cell').at(-2)!.textContent!.replace(/\D/g, '')))
    expect(rev).toEqual([...rev].sort((a, b) => a - b))
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(fileArg()).toBe('ranking-productos-ultimos-30-dias.csv')
    expect(csvArg()).toContain('"Producto","Unidades","Ingresos (Gs.)"')
  })

  it('categorías y pagos: dos reportes con exportación propia', async () => {
    const user = userEvent.setup()
    open('/admin/reportes')
    await h1('Reportes')
    await user.click(screen.getByRole('tab', { name: 'Categorías y pagos' }))
    const cat = screen.getByRole('region', { name: 'Ventas por categoría' })
    const pay = screen.getByRole('region', { name: 'Ventas por medio de pago' })
    expect(within(cat).getAllByRole('listitem').length).toBeGreaterThan(2)
    await user.click(within(pay).getByRole('button', { name: 'Exportar CSV' }))
    expect(fileArg()).toBe('ventas-por-medio-de-pago-ultimos-30-dias.csv')
    await user.click(within(cat).getByRole('button', { name: 'Exportar CSV' }))
    expect(fileArg()).toBe('ventas-por-categoria-ultimos-30-dias.csv')
  })
})

describe('clientes', () => {
  it('lista clientes derivados de los pedidos, con segmentos y buscador', async () => {
    const user = userEvent.setup()
    open('/admin/clientes')
    await h1('Clientes')
    const total = Number(
      screen.getByRole('button', { name: /^Todos/ }).textContent!.match(/\((\d+)\)/)![1],
    )
    expect(total).toBeGreaterThan(15)
    await user.click(screen.getByRole('button', { name: /^VIP/ }))
    for (const r of screen.getAllByRole('row').slice(1))
      expect(within(r).getByText('VIP')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Todos/ }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar clientes' }), 'zzzzqq')
    expect(screen.getByText('Ningún cliente coincide')).toBeInTheDocument()
  })

  it('el detalle muestra el historial y enlaza a cada pedido', async () => {
    const user = userEvent.setup()
    open('/admin/clientes')
    await h1('Clientes')
    const first = screen.getAllByRole('row')[1]
    await user.click(within(first).getAllByRole('button')[0])
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Historial de pedidos' }),
    ).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Escribir por WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringMatching(/wa\.me\/595/),
    )
    expect(within(dialog).getAllByRole('link', { name: /^PED-/ })[0]).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/admin\/pedidos\?pedido=PED-/),
    )
  })

  it('un pedido hecho en la tienda crea (o suma a) un cliente', async () => {
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.4))
    open('/admin/clientes')
    await h1('Clientes')
    await userEventSearch('María Fernández')
    expect(screen.getAllByRole('row').length).toBe(2)
  })

  it('exporta los clientes visibles a CSV', async () => {
    const user = userEvent.setup()
    open('/admin/clientes')
    await h1('Clientes')
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(fileArg()).toBe('clientes.csv')
    expect(csvArg()).toContain('"Cliente","Teléfono","Ciudad","Pedidos"')
  })

  it('?cliente= abre el detalle directamente', async () => {
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.5))
    open('/admin/clientes?cliente=0981234567')
    expect(
      await screen.findByRole('dialog', { name: 'María Fernández' }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })
})

async function userEventSearch(text: string) {
  await userEvent.setup().type(screen.getByRole('searchbox', { name: 'Buscar clientes' }), text)
}

describe('inventario', () => {
  const products = getAllProductsIncludingDrafts()

  it('muestra el resumen y una fila por producto o variante', async () => {
    open('/admin/inventario')
    await h1('Inventario')
    const s = summarizeInventory(buildInventoryRows(products, 5))
    const main = within(screen.getByRole('main'))
    expect(main.getByText('Unidades en stock').parentElement).toHaveTextContent(
      String(s.units).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    )
    expect(screen.getByText(new RegExp(`de ${s.items} ítems`))).toBeInTheDocument()
  })

  it(
    'filtra por estado y el umbral cambia qué se considera stock bajo',
    { timeout: 20_000 },
    async () => {
      const user = userEvent.setup()
      open('/admin/inventario')
      await h1('Inventario')
      await user.click(screen.getByRole('button', { name: 'Agotados' }))
      for (const r of screen.getAllByRole('row').slice(1))
        expect(within(r).getByText('Agotado')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Stock bajo' }))
      const lowAt5 = Number(screen.getByText(/Mostrando/).textContent!.match(/de (\d+)/)![1])
      await user.clear(screen.getByLabelText(/Avisar con menos de/))
      await user.type(screen.getByLabelText(/Avisar con menos de/), '30')
      const lowAt30 = Number(screen.getByText(/Mostrando/).textContent!.match(/de (\d+)/)![1])
      expect(lowAt30).toBeGreaterThan(lowAt5)
    },
  )

  it('?estado=bajo abre la lista filtrada y "Reponer" solo avisa', async () => {
    const user = userEvent.setup()
    open('/admin/inventario?estado=bajo')
    await h1('Inventario')
    expect(screen.getByRole('button', { name: 'Stock bajo', pressed: true })).toBeInTheDocument()
    await user.click(
      within(screen.getAllByRole('row')[1]).getByRole('button', { name: /^Reponer / }),
    )
    expect(
      screen.getAllByText('Reponer stock no está disponible en la demo').length,
    ).toBeGreaterThan(0)
  })

  it('filtra por categoría y búsqueda, y exporta a CSV lo que se ve', async () => {
    const user = userEvent.setup()
    open('/admin/inventario')
    await h1('Inventario')
    await user.selectOptions(screen.getByLabelText('Categoría:'), 'electrodomesticos')
    const expected = buildInventoryRows(products, 5).filter(
      (r) => r.categoryId === 'electrodomesticos',
    ).length
    await waitFor(() =>
      expect(screen.getByText(new RegExp(`de ${expected} ítems`))).toBeInTheDocument(),
    )
    await user.type(screen.getByRole('searchbox', { name: 'Buscar en el inventario' }), 'zzzzqq')
    expect(screen.getByText('Ningún ítem coincide')).toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox'))
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(fileArg()).toBe('inventario.csv')
    expect(csvArg()).toContain('"Producto","Variante","SKU","Stock","Estado"')
  })
})
