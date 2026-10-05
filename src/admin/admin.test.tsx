import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/App'
import { downloadBlob } from '@/utils/download'
import { renderWithProviders } from '@/test/renderWithProviders'
import { buildDemoOrder } from '@/utils/demoOrder'
import { saveOrder } from '@/utils/orders'
import { hydrate } from '@/utils/cart'
import { sampleCartItems } from '@/services/demoService'
import { getProductById } from '@/services/catalogService'
import { buildTemplate } from '@/utils/xlsx/template'
import { getCategories } from '@/services/catalogService'

vi.mock('@/utils/download', () => ({ downloadBlob: vi.fn() }))

const login = () => window.localStorage.setItem('tienda-demo:admin-session', 'true')
const open = (path: string) => {
  login()
  return renderWithProviders(<AppRoutes />, path)
}
const h1 = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 8000 })

afterEach(() => {
  vi.clearAllMocks()
  document.head.querySelectorAll('meta[name=robots]').forEach((m) => m.remove())
})

describe('acceso', () => {
  it('sin sesión redirige al login; "Entrar como demo" abre el dashboard y cerrar sesión vuelve', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppRoutes />, '/admin/productos')
    expect(await h1('Panel administrador')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Entrar como demo' }))
    expect(await h1('Dashboard')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('tienda-demo:admin-session')!)).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await h1('Panel administrador')).toBeInTheDocument()
  })

  it('el panel es noindex y muestra el aviso de modo demo', async () => {
    open('/admin')
    await h1('Dashboard')
    expect(document.head.querySelector('meta[name=robots]')).toHaveAttribute(
      'content',
      expect.stringContaining('noindex'),
    )
    expect(screen.getByRole('note')).toHaveTextContent('Modo demo — los cambios no se guardan')
  })

  it('la navegación lateral lleva a cada sección', { timeout: 30_000 }, async () => {
    const user = userEvent.setup()
    open('/admin')
    await h1('Dashboard')
    const nav = screen.getByRole('navigation', { name: 'Panel administrador', hidden: false })
    for (const [label, heading] of [
      ['Productos', 'Productos'],
      ['Importar XLSX', 'Importar productos desde XLSX'],
      ['Pedidos', 'Pedidos'],
      ['Categorías', 'Categorías'],
      ['Apariencia', 'Apariencia'],
      ['Configuración', 'Configuración'],
    ] as const) {
      await user.click(within(nav).getByRole('link', { name: label }))
      expect(await h1(heading)).toBeInTheDocument()
    }
  })
})

describe('dashboard', () => {
  it('muestra KPIs, gráfico accesible, más vendidos y stock bajo', async () => {
    open('/admin')
    await h1('Dashboard')
    const main = within(screen.getByRole('main'))
    for (const k of ['Ventas', 'Pedidos', 'Ticket promedio', 'Productos activos'])
      expect(main.getByText(k)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ventas de los últimos 14 días' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Productos más vendidos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stock bajo' })).toBeInTheDocument()
  })
})

describe('productos', () => {
  it('lista 10 por página, busca y filtra por estado; las acciones solo avisan', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    expect(screen.getAllByRole('row')).toHaveLength(11) // encabezado + 10
    expect(screen.getByText(/Mostrando 1-10 de 72/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Borradores' }))
    expect(screen.getByText(/Rack para TV/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Todos' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar productos' }), 'zzzz-no-existe')
    expect(screen.getByText('Ningún producto coincide')).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'lenovo')
    await user.click(
      within(screen.getAllByRole('row')[1]).getByRole('button', { name: /^Editar / }),
    )
    expect(screen.getAllByText('Esta acción no está disponible en la demo').length).toBeGreaterThan(
      0,
    )
  })
})

describe('pedidos', () => {
  it('muestra pedidos de ejemplo y el pedido hecho en la demo, con su detalle', async () => {
    const user = userEvent.setup()
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.1))
    open('/admin/pedidos')
    await h1('Pedidos')
    expect(screen.getAllByRole('row').length).toBeGreaterThan(10)
    expect(screen.getByText('TU PEDIDO')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /^Ver pedido PED-/ })[0])
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Productos')).toBeInTheDocument()
    expect(within(dialog).getByText(/María Fernández/)).toBeInTheDocument()
  })

  it('filtra por estado', async () => {
    const user = userEvent.setup()
    open('/admin/pedidos')
    await h1('Pedidos')
    await user.selectOptions(screen.getByLabelText('Estado:'), 'entregado')
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) expect(within(r).getByText('Entregado')).toBeInTheDocument()
  })
})

describe('categorías, apariencia y configuración', () => {
  it('categorías muestra el árbol con conteos', async () => {
    open('/admin/categorias')
    await h1('Categorías')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10)
    expect(screen.getAllByRole('listitem').some((li) => li.textContent === 'Notebooks (19)')).toBe(
      true,
    )
  })

  it('apariencia cambia la paleta de toda la tienda', async () => {
    const user = userEvent.setup()
    open('/admin/apariencia')
    await h1('Apariencia')
    await user.click(screen.getByRole('radio', { name: 'Violeta' }))
    expect(document.documentElement.dataset.theme).toBe('violeta')
    expect(screen.getByRole('radio', { name: 'Violeta' })).toBeChecked()
    await user.clear(screen.getByLabelText('Nombre en el logo'))
    await user.type(screen.getByLabelText('Nombre en el logo'), 'MI MARCA')
    expect(
      within(screen.getByRole('group', { name: 'Vista previa' })).getAllByText('MI MARCA').length,
    ).toBeGreaterThan(0)
  })

  it('configuración: guardar solo avisa que es una demo', async () => {
    const user = userEvent.setup()
    open('/admin/configuracion')
    await h1('Configuración')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(
      screen.getAllByText('Los cambios no se guardan: es una demostración').length,
    ).toBeGreaterThan(0)
  })
})

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

async function xlsxFile(sheets: Record<string, unknown[][]>, name = 'productos.xlsx') {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const [n, aoa] of Object.entries(sheets))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), n)
  return new File([XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer], name, {
    type: XLSX_TYPE,
  })
}

describe('importador XLSX', () => {
  const upload = (file: File, applyAccept = true) => {
    const user = userEvent.setup({ applyAccept })
    return user.upload(screen.getByLabelText(/Arrastrá tu archivo/), file)
  }

  it('descarga la plantilla', async () => {
    const user = userEvent.setup()
    open('/admin/importar')
    await h1('Importar productos desde XLSX')
    await user.click(screen.getByRole('button', { name: 'Descargar plantilla' }))
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled())
    expect(vi.mocked(downloadBlob).mock.calls[0][1]).toBe('plantilla-productos.xlsx')
  })

  it(
    'la plantilla se vuelve a subir, valida sin errores y se importa (simulado)',
    { timeout: 20_000 },
    async () => {
      const user = userEvent.setup()
      open('/admin/importar')
      await h1('Importar productos desde XLSX')
      await upload(
        new File([await buildTemplate(getCategories())], 'plantilla.xlsx', { type: XLSX_TYPE }),
      )

      expect(
        await screen.findByText(/El archivo es válido: se pueden importar 2 productos/),
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Productos (2)' })).toBeInTheDocument()
      await user.click(screen.getByRole('tab', { name: 'Productos (2)' }))
      expect(screen.getByText('TD-5001')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Importar 2 productos' }))
      expect(
        await screen.findByRole('heading', { name: '¡2 productos importados!' }, { timeout: 3000 }),
      ).toBeInTheDocument()
      expect(screen.getByText(/el catálogo de la demo no se modificó/)).toBeInTheDocument()
    },
  )

  it(
    'un archivo con errores muestra cada uno con hoja/fila/columna y bloquea la importación',
    { timeout: 20_000 },
    async () => {
      const user = userEvent.setup()
      open('/admin/importar')
      await h1('Importar productos desde XLSX')
      const header = [
        'sku',
        'nombre',
        'marca',
        'categoria',
        'subcategoria',
        'precio',
        'stock',
        'descripcion_corta',
        'descripcion',
        'imagen_principal',
      ]
      const file = await xlsxFile({
        Productos: [
          header,
          [
            'X-1',
            'Producto con precio malo',
            'Acme',
            'Informática',
            'Notebooks',
            'abc',
            '3',
            'corta',
            'Una descripción suficientemente larga para esta prueba.',
            'placeholder',
          ],
        ],
      })
      await upload(file)

      expect(await screen.findByText(/Hay 1 error\. Corregilos/)).toBeInTheDocument()
      const row = within(screen.getByRole('tabpanel'))
        .getAllByRole('row')
        .find((r) => within(r).queryByText('precio'))!
      expect(within(row).getByText('Productos')).toBeInTheDocument()
      expect(within(row).getByText('2')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Importar/ })).toBeDisabled()

      await user.click(screen.getByRole('button', { name: 'Descargar problemas (CSV)' }))
      expect(vi.mocked(downloadBlob).mock.calls[0][1]).toBe('problemas-importacion.csv')
      expect(String(vi.mocked(downloadBlob).mock.calls[0][0])).toContain(
        '"Error","Productos","2","precio"',
      )
    },
  )

  it('rechaza archivos que no son .xlsx', async () => {
    open('/admin/importar')
    await h1('Importar productos desde XLSX')
    await upload(new File(['a,b'], 'datos.csv', { type: 'text/csv' }), false)
    expect(await screen.findByRole('alert')).toHaveTextContent('.xlsx')
  })

  it('un .xlsx dañado muestra un mensaje claro', async () => {
    open('/admin/importar')
    await h1('Importar productos desde XLSX')
    await upload(new File(['esto no es un excel'], 'roto.xlsx', { type: XLSX_TYPE }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
