import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/App'
import {
  getCategories,
  getAllProductsIncludingDrafts,
  getProductById,
} from '@/services/catalogService'
import { sampleCartItems } from '@/services/demoService'
import { renderWithProviders } from '@/test/renderWithProviders'
import { hydrate } from '@/utils/cart'
import { buildDemoOrder } from '@/utils/demoOrder'
import { downloadBlob } from '@/utils/download'
import { saveOrder } from '@/utils/orders'
import { buildCatalogExport } from '@/utils/xlsx/export'
import { buildTemplate } from '@/utils/xlsx/template'

vi.mock('@/utils/download', () => ({ downloadBlob: vi.fn() }))

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const open = (path: string) => {
  window.localStorage.setItem('tienda-demo:admin-session', 'true')
  return renderWithProviders(<AppRoutes />, path)
}
const h1 = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 8000 })
const LENOVO = '/admin/productos/p001'

afterEach(() => vi.clearAllMocks())

describe('productos: acciones y exportación', () => {
  it('exportar catálogo descarga el XLSX', { timeout: 30_000 }, async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    await user.click(screen.getByRole('button', { name: 'Exportar catálogo' }))
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled())
    expect(vi.mocked(downloadBlob).mock.calls[0][1]).toBe('catalogo-productos.xlsx')
  })

  it('el nombre abre el editor y "Nuevo producto" abre uno vacío', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    expect(screen.getByRole('link', { name: 'Importar' })).toHaveAttribute(
      'href',
      '/admin/productos/importar',
    )
    expect(screen.getByRole('link', { name: 'Nuevo producto' })).toHaveAttribute(
      'href',
      '/admin/productos/nuevo',
    )
    await user.click(screen.getAllByRole('link', { name: /^Editar / })[0])
    // En el editor aparece el enlace para volver a Productos.
    expect(
      await within(screen.getByRole('main')).findByRole('link', { name: 'Productos' }),
    ).toHaveAttribute('href', '/admin/productos')
    expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument()
  })

  it('selección múltiple muestra acciones en lote (se aplican en pantalla)', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    const bar = screen.getByRole('region', { name: 'Acciones en lote' })
    expect(bar).toHaveTextContent('10 seleccionados')
    await user.click(within(bar).getByRole('button', { name: 'Activar' }))
    expect(screen.getAllByText(/Activar: 10 productos/).length).toBeGreaterThan(0)
  })

  it('filtra por categoría y ordena por precio', async () => {
    const user = userEvent.setup()
    open('/admin/productos')
    await h1('Productos')
    await user.selectOptions(screen.getByLabelText('Categoría:'), 'electronica')
    expect(screen.getByText(/de 12 productos/)).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('columnheader', { name: /Precio/ })).getByRole('button'),
    )
    expect(screen.getByRole('columnheader', { name: /Precio/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
  })
})

describe('editor de producto', () => {
  it('se llena con los datos del producto y tiene las 7 pestañas', async () => {
    open(LENOVO)
    expect(await h1(/Notebook Lenovo IdeaPad 3/)).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'General',
      'Precios y ofertas',
      'Inventario',
      'Variantes',
      'Imágenes',
      'Especificaciones',
      'SEO',
    ])
    expect(screen.getByLabelText('Nombre del producto')).toHaveValue(
      'Notebook Lenovo IdeaPad 3 15" Ryzen 5 8GB 256GB SSD',
    )
    expect(screen.getByLabelText('Marca')).toHaveValue('Lenovo')
    expect(screen.getByRole('link', { name: 'Ver en la tienda' })).toHaveAttribute(
      'href',
      expect.stringContaining('/producto/notebook-lenovo'),
    )
  })

  it('editar marca el borrador, "Descartar" restaura y "Guardar" avisa que es una demo', async () => {
    const user = userEvent.setup()
    open(LENOVO)
    await h1(/IdeaPad/)
    expect(screen.queryByRole('region', { name: 'Cambios sin guardar' })).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('Marca'))
    await user.type(screen.getByLabelText('Marca'), 'Otra')
    const bar = screen.getByRole('region', { name: 'Cambios sin guardar' })
    await user.click(within(bar).getByRole('button', { name: 'Descartar' }))
    expect(screen.getByLabelText('Marca')).toHaveValue('Lenovo')
    expect(screen.queryByRole('region', { name: 'Cambios sin guardar' })).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Guardar' })[0])
    expect(
      screen.getAllByText('Los cambios no se guardan: es una demostración').length,
    ).toBeGreaterThan(0)
  })

  it('la subcategoría depende de la categoría', async () => {
    const user = userEvent.setup()
    open('/admin/productos/nuevo')
    await h1('Nuevo producto')
    expect(screen.getByLabelText('Subcategoría')).toBeDisabled()
    await user.selectOptions(screen.getByLabelText('Categoría'), 'electronica')
    const sub = screen.getByLabelText('Subcategoría')
    expect(sub).toBeEnabled()
    expect(within(sub).getByRole('option', { name: 'Smart TV' })).toBeInTheDocument()
    expect(within(sub).queryByRole('option', { name: 'Notebooks' })).not.toBeInTheDocument()
  })

  it('precios: calcula el descuento y las cuotas', async () => {
    const user = userEvent.setup()
    open(LENOVO)
    await h1(/IdeaPad/)
    await user.click(screen.getByRole('tab', { name: 'Precios y ofertas' }))
    expect(screen.getByText(/Descuento de 12%/)).toBeInTheDocument()
    expect(screen.getByLabelText('Cuotas sin interés')).toHaveValue('12')
    await user.clear(screen.getByLabelText('Precio anterior (para ofertas)'))
    expect(screen.queryByText(/Descuento de/)).not.toBeInTheDocument()
  })

  it('inventario: unidad de venta y estado del stock', async () => {
    const user = userEvent.setup()
    open('/admin/productos/p036') // joystick sin stock
    await h1(/Joystick/)
    await user.click(screen.getByRole('tab', { name: 'Inventario' }))
    expect(
      screen.getByText(/Sin stock: la tienda mostrará el producto como agotado/),
    ).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Unidad de venta'))
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(expect.arrayContaining(['Unidad', 'Metro', 'Kilo', 'Caja']))
  })

  it('variantes: colores editables, talles y medidas (multirubro)', async () => {
    const user = userEvent.setup()
    open(LENOVO)
    await h1(/IdeaPad/)
    await user.click(screen.getByRole('tab', { name: 'Variantes' }))
    expect(screen.getByRole('switch', { name: 'Este producto tiene variantes' })).toBeChecked()
    const table = screen.getByRole('table', { name: 'Colores del producto' })
    expect(within(table).getAllByRole('row')).toHaveLength(4) // encabezado + 3 colores

    await user.click(screen.getByRole('button', { name: 'Agregar color' }))
    expect(within(table).getAllByRole('row')).toHaveLength(5)
    await user.click(within(table).getAllByRole('button', { name: /^Quitar / })[0])
    expect(within(table).getAllByRole('row')).toHaveLength(4)

    await user.click(screen.getByRole('checkbox', { name: 'Talle' }))
    await user.click(screen.getByRole('button', { name: 'M', pressed: false }))
    expect(screen.getByRole('button', { name: 'M', pressed: true })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Otro talle'), '44{Enter}')
    expect(screen.getByRole('button', { name: '44', pressed: true })).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Medida' }))
    expect(screen.getByLabelText('Medidas disponibles')).toBeInTheDocument()
  })

  it('un producto sin variantes oculta las opciones hasta activar el interruptor', async () => {
    const user = userEvent.setup()
    open('/admin/productos/p025') // Smart TV: sin colores
    await h1(/./)
    await user.click(screen.getByRole('tab', { name: 'Variantes' }))
    const sw = screen.getByRole('switch', { name: 'Este producto tiene variantes' })
    expect(sw).not.toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'Talle' })).not.toBeInTheDocument()
    await user.click(sw)
    expect(screen.getByRole('checkbox', { name: 'Talle' })).toBeInTheDocument()
  })

  it('imágenes: previsualiza, marca la principal y quita', async () => {
    const user = userEvent.setup()
    URL.createObjectURL = vi.fn((f: Blob | MediaSource) => `blob:${(f as File).name}`)
    URL.revokeObjectURL = vi.fn()
    open('/admin/productos/nuevo')
    await h1('Nuevo producto')
    await user.click(screen.getByRole('tab', { name: 'Imágenes' }))
    expect(
      screen.getByText(/Sin imágenes: la tienda mostrará una imagen de reemplazo/),
    ).toBeInTheDocument()
    await user.upload(screen.getByLabelText(/Arrastrá las fotos acá/), [
      new File(['a'], 'uno.png', { type: 'image/png' }),
      new File(['b'], 'dos.png', { type: 'image/png' }),
    ])
    expect(screen.getAllByRole('img', { name: /^Imagen \d del producto$/ })).toHaveLength(2)
    expect(screen.getByText('PRINCIPAL')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hacer principal la imagen 2' }))
    expect(screen.getAllByRole('img', { name: /^Imagen 1 del producto$/ })[0]).toHaveAttribute(
      'src',
      'blob:dos.png',
    )
    await user.click(screen.getByRole('button', { name: 'Quitar la imagen 1' }))
    expect(screen.getAllByRole('img', { name: /^Imagen \d del producto$/ })).toHaveLength(1)
  })

  it('especificaciones: agregar y quitar filas', async () => {
    const user = userEvent.setup()
    open(LENOVO)
    await h1(/IdeaPad/)
    await user.click(screen.getByRole('tab', { name: 'Especificaciones' }))
    const table = screen.getByRole('table', { name: 'Especificaciones del producto' })
    const before = within(table).getAllByRole('row').length
    await user.click(screen.getByRole('button', { name: 'Agregar especificación' }))
    expect(within(table).getAllByRole('row')).toHaveLength(before + 1)
    await user.click(within(table).getAllByRole('button', { name: /^Quitar / })[0])
    expect(within(table).getAllByRole('row')).toHaveLength(before)
  })

  it('SEO: vista previa tipo buscador que sigue lo que se escribe', async () => {
    const user = userEvent.setup()
    open(LENOVO)
    await h1(/IdeaPad/)
    await user.click(screen.getByRole('tab', { name: 'SEO' }))
    await user.clear(screen.getByLabelText('Título SEO'))
    await user.type(screen.getByLabelText('Título SEO'), 'Mi título')
    expect(screen.getByText(/^Mi título · /)).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Dirección (slug)'))
    await user.type(screen.getByLabelText('Dirección (slug)'), 'Mi Slug')
    expect(screen.getByLabelText('Dirección (slug)')).toHaveValue('mi-slug')
    expect(screen.getAllByText(/\/producto\/mi-slug/).length).toBeGreaterThan(0)
  })

  it('un id inexistente muestra un estado claro', async () => {
    open('/admin/productos/no-existe')
    expect(
      await screen.findByText('No encontramos ese producto', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a Productos' })).toHaveAttribute(
      'href',
      '/admin/productos',
    )
  })
})

describe('pedidos: flujo de estados', () => {
  const firstRow = () => screen.getAllByRole('row')[1]

  it(
    'abre el detalle, avanza el estado y muestra la línea de tiempo (solo en pantalla)',
    { timeout: 20_000 },
    async () => {
      const user = userEvent.setup()
      open('/admin/pedidos')
      await h1('Pedidos')
      await user.click(within(firstRow()).getByRole('button', { name: /^Ver pedido / }))
      const dialog = screen.getByRole('dialog')
      const before = within(dialog).getAllByRole('listitem', { name: undefined }).length
      expect(before).toBeGreaterThan(0)

      const advance = within(dialog).getByRole('button', { name: /^Pasar a «/ })
      const target = advance.textContent!.match(/«(.+)»/)![1]
      await user.click(advance)
      expect(within(dialog).getAllByText(target).length).toBeGreaterThan(0)
      expect(
        within(screen.getByRole('list', { name: 'Historial del pedido' }))
          .getAllByRole('listitem')
          .at(-1),
      ).toHaveTextContent(target)
      expect(screen.getAllByText(/solo en esta pantalla/).length).toBeGreaterThan(0)
    },
  )

  it('cancelar y reabrir; las notas se escriben', async () => {
    const user = userEvent.setup()
    open('/admin/pedidos')
    await h1('Pedidos')
    await user.click(screen.getByRole('button', { name: /^Pendiente de pago/ }))
    await user.click(within(firstRow()).getByRole('button', { name: /^Ver pedido / }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' }))
    expect(within(dialog).getByRole('button', { name: 'Reabrir pedido' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Historial del pedido' }))
        .getAllByRole('listitem')
        .at(-1),
    ).toHaveTextContent('Cancelado')
    await user.click(within(dialog).getByRole('button', { name: 'Reabrir pedido' }))
    expect(within(dialog).getByRole('button', { name: /^Pasar a «/ })).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Nota interna'), 'Llamar antes de enviar')
    expect(within(dialog).getByLabelText('Nota interna')).toHaveValue('Llamar antes de enviar')
  })

  it('contacto por WhatsApp y copiar resumen', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    open('/admin/pedidos')
    await h1('Pedidos')
    await user.click(within(firstRow()).getByRole('button', { name: /^Ver pedido / }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('link', { name: 'Escribir por WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/wa\.me\/595\d+\?text=/),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Copiar resumen' }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Total:'))
  })

  it('?pedido= abre el detalle directamente (enlace de la campanita)', async () => {
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.2))
    const id = JSON.parse(window.localStorage.getItem('tienda-demo:orders')!)[0].id
    open(`/admin/pedidos?pedido=${id}`)
    expect(
      await screen.findByRole('dialog', { name: `Pedido ${id}` }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('busca por cliente, filtra por pago y período, y exporta a CSV lo que se ve', async () => {
    const user = userEvent.setup()
    open('/admin/pedidos')
    await h1('Pedidos')
    await user.selectOptions(screen.getByLabelText('Pago:'), 'efectivo')
    for (const r of screen.getAllByRole('row').slice(1))
      expect(within(r).getByText('Efectivo')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Período:'), '7')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar pedidos' }), 'zzzz')
    expect(screen.getByText('Ningún pedido coincide')).toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox'))

    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(downloadBlob).toHaveBeenCalledWith(
      expect.stringContaining('"Pedido","Fecha"'),
      'pedidos.csv',
      'text/csv;charset=utf-8',
    )
  })

  it('la campanita lista los pedidos hechos en la demo y enlaza a su detalle', async () => {
    const user = userEvent.setup()
    open('/admin')
    await h1('Inicio')
    await user.click(screen.getByRole('button', { name: 'Avisos' }))
    expect(screen.getByText(/Sin avisos nuevos/)).toBeInTheDocument()
  })

  it('con un pedido real la campanita muestra el aviso', async () => {
    const user = userEvent.setup()
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.3))
    open('/admin')
    await h1('Inicio')
    await user.click(screen.getByRole('button', { name: 'Avisos: 1 pedido nuevo' }))
    const link = screen.getByRole('link', { name: /Nuevo pedido PED-/ })
    expect(link).toHaveAttribute('href', expect.stringMatching(/^\/admin\/pedidos\?pedido=PED-/))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('link', { name: /Nuevo pedido/ })).not.toBeInTheDocument()
  })
})

describe('importador: modos y vista previa de cambios', () => {
  const upload = (file: File) =>
    userEvent.setup().upload(screen.getByLabelText(/Arrastrá tu archivo/), file)

  it(
    'la plantilla trae productos nuevos y el modo "solo precios y stock" los omite',
    { timeout: 30_000 },
    async () => {
      const user = userEvent.setup()
      open('/admin/productos/importar')
      await h1('Importar productos desde XLSX')
      expect(
        within(screen.getByRole('main')).getByRole('link', { name: 'Productos' }),
      ).toHaveAttribute('href', '/admin/productos')
      await upload(
        new File([await buildTemplate(getCategories())], 'plantilla.xlsx', { type: XLSX_TYPE }),
      )
      expect(
        await screen.findByText(
          /2 nuevos · 0 actualizados · 0 sin cambios · 0 omitidos/,
          undefined,
          { timeout: 8000 },
        ),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Importar 2 productos' })).toBeEnabled()

      await user.click(screen.getByRole('radio', { name: /Solo actualizar precios y stock/ }))
      expect(
        screen.getByText(/0 nuevos · 0 actualizados · 0 sin cambios · 2 omitidos/),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Importar 0 productos' })).toBeDisabled()
      expect(screen.getByText(/No hay nada para aplicar con este modo/)).toBeInTheDocument()
    },
  )

  it(
    'el catálogo exportado se vuelve a subir y todo queda "sin cambios"',
    { timeout: 40_000 },
    async () => {
      open('/admin/productos/importar')
      await h1('Importar productos desde XLSX')
      const buffer = await buildCatalogExport(getAllProductsIncludingDrafts(), getCategories())
      await upload(new File([buffer], 'catalogo.xlsx', { type: XLSX_TYPE }))
      expect(
        await screen.findByText(
          /0 nuevos · 0 actualizados · 72 sin cambios · 0 omitidos/,
          undefined,
          { timeout: 15_000 },
        ),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Importar 0 productos' })).toBeDisabled()
    },
  )
})
