import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/App'
import { sampleCartItems } from '@/services/demoService'
import { renderWithProviders } from '@/test/renderWithProviders'
import { a11yViolations } from '@/test/axe'

const seedCart = () =>
  window.localStorage.setItem('tienda-demo:cart', JSON.stringify(sampleCartItems()))
const login = () => window.localStorage.setItem('tienda-demo:admin-session', 'true')

const LENOVO = '/producto/notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd'

describe('accesibilidad (axe) de las pantallas de la tienda', () => {
  it.each([
    ['Home', '/'],
    ['Categoría', '/categoria/notebooks'],
    [
      'Categoría con filtros',
      '/categoria/notebooks?marca=Lenovo&precio=3000000-8000000&f.Memoria+RAM=8+GB',
    ],
    ['Búsqueda', '/buscar?q=lenovo'],
    ['Búsqueda sin resultados', '/buscar?q=zzzzqq'],
    ['Producto', LENOVO],
    ['Producto sin stock', '/producto/joystick-inalambrico-para-consola'],
    ['404', '/no-existe'],
  ])('%s no tiene violaciones', async (_n, path) => {
    renderWithProviders(<AppRoutes />, path)
    await screen.findByRole('heading', { level: 1 }, { timeout: 8000 })
    expect(await a11yViolations()).toEqual([])
  })

  it('Carrito con productos y vacío', { timeout: 20_000 }, async () => {
    seedCart()
    const { unmount } = renderWithProviders(<AppRoutes />, '/carrito')
    await screen.findByRole('heading', { level: 1 }, { timeout: 8000 })
    expect(await a11yViolations()).toEqual([])
    unmount()
    window.localStorage.clear()
    renderWithProviders(<AppRoutes />, '/carrito')
    await screen.findByText('Tu carrito está vacío')
    expect(await a11yViolations()).toEqual([])
  })

  it('Checkout (pasos 1 y 2, con errores de validación)', { timeout: 30_000 }, async () => {
    const user = userEvent.setup()
    seedCart()
    renderWithProviders(<AppRoutes />, '/checkout')
    await screen.findByRole('button', { name: 'Continuar al pago' }, { timeout: 8000 })
    await user.click(screen.getByRole('button', { name: 'Continuar al pago' }))
    expect(await a11yViolations()).toEqual([])

    await user.type(screen.getByLabelText('Nombre y apellido'), 'María Fernández')
    await user.type(screen.getByLabelText('Teléfono'), '0981234567')
    await user.type(screen.getByLabelText('Dirección'), 'Mcal. López 1234')
    await user.type(screen.getByLabelText('Ciudad'), 'Asunción')
    await user.selectOptions(screen.getByLabelText('Departamento'), 'Central')
    await user.type(screen.getByLabelText('Código postal'), '1209')
    await user.click(screen.getByRole('button', { name: 'Continuar al pago' }))
    await user.click(screen.getByRole('checkbox', { name: /Acepto los términos/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(await a11yViolations()).toEqual([])
  })

  it('menús desplegables (categorías y carrito) abiertos', async () => {
    const user = userEvent.setup()
    seedCart()
    renderWithProviders(<AppRoutes />, '/')
    await user.click(screen.getByRole('button', { name: 'Abrir menú de categorías' }))
    expect(await a11yViolations()).toEqual([])
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /^Carrito, \d/ }))
    expect(await a11yViolations()).toEqual([])
  })
})

describe('accesibilidad (axe) de las pantallas nuevas del panel', () => {
  it('editor de producto: todas las pestañas', { timeout: 40_000 }, async () => {
    const user = userEvent.setup()
    login()
    renderWithProviders(<AppRoutes />, '/admin/productos/p001')
    await screen.findByRole('heading', { level: 1, name: /IdeaPad/ }, { timeout: 15_000 })
    for (const tab of [
      'General',
      'Precios y ofertas',
      'Inventario',
      'Variantes',
      'Imágenes',
      'Especificaciones',
      'SEO',
    ]) {
      await user.click(screen.getByRole('tab', { name: tab }))
      expect(await a11yViolations(), `pestaña ${tab}`).toEqual([])
    }
  })

  it('detalle de un pedido y selección en la tabla de productos', { timeout: 40_000 }, async () => {
    const user = userEvent.setup()
    login()
    const { unmount } = renderWithProviders(<AppRoutes />, '/admin/pedidos')
    await screen.findByRole('heading', { level: 1, name: 'Pedidos' }, { timeout: 15_000 })
    await user.click(screen.getAllByRole('button', { name: /^Ver pedido / })[0])
    expect(await a11yViolations()).toEqual([])
    unmount()

    renderWithProviders(<AppRoutes />, '/admin/productos')
    await screen.findByRole('heading', { level: 1, name: 'Productos' }, { timeout: 15_000 })
    await user.click(screen.getByRole('checkbox', { name: 'Seleccionar todos los de esta página' }))
    expect(await a11yViolations()).toEqual([])
  })
})

describe('accesibilidad (axe) de la Etapa C', () => {
  it.each([
    ['Cupones', '/admin/marketing/cupones'],
    ['Beneficios con bancos', '/admin/marketing/bancos'],
    ['Banners y destacados', '/admin/marketing/banners'],
    ['Apariencia', '/admin/apariencia'],
  ])('%s no tiene violaciones', { timeout: 30_000 }, async (_n, path) => {
    login()
    renderWithProviders(<AppRoutes />, path)
    await screen.findByRole('heading', { level: 1 }, { timeout: 15_000 })
    expect(await a11yViolations()).toEqual([])
  })

  it(
    'banners: pestaña de destacados; cupones: formulario; bancos: formulario',
    { timeout: 40_000 },
    async () => {
      const user = userEvent.setup()
      login()
      let view = renderWithProviders(<AppRoutes />, '/admin/marketing/banners')
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Banners y destacados' },
        { timeout: 15_000 },
      )
      await user.click(screen.getByRole('tab', { name: 'Productos destacados' }))
      expect(await a11yViolations()).toEqual([])
      view.unmount()

      view = renderWithProviders(<AppRoutes />, '/admin/marketing/cupones')
      await screen.findByRole('heading', { level: 1, name: 'Cupones' }, { timeout: 15_000 })
      await user.click(screen.getByRole('button', { name: 'Nuevo cupón' }))
      await user.click(screen.getByRole('button', { name: 'Crear cupón' })) // con errores visibles
      expect(await a11yViolations()).toEqual([])
      view.unmount()

      renderWithProviders(<AppRoutes />, '/admin/marketing/bancos')
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Beneficios con bancos' },
        { timeout: 15_000 },
      )
      await user.click(screen.getByRole('button', { name: 'Agregar beneficio' }))
      expect(await a11yViolations()).toEqual([])
    },
  )

  it('configuración: cada pestaña, y el buscador global abierto', { timeout: 60_000 }, async () => {
    const user = userEvent.setup()
    login()
    const view = renderWithProviders(<AppRoutes />, '/admin/configuracion')
    await screen.findByRole('heading', { level: 1, name: 'Configuración' }, { timeout: 15_000 })
    for (const tab of ['General', 'Envíos', 'Pagos', 'Impuestos', 'Usuarios y roles']) {
      await user.click(screen.getByRole('tab', { name: tab }))
      expect(await a11yViolations(), `pestaña ${tab}`).toEqual([])
    }
    await user.keyboard('{Control>}k{/Control}')
    await user.type(screen.getByRole('combobox', { name: 'Buscar en el panel' }), 'lenovo')
    expect(await a11yViolations()).toEqual([])
    view.unmount()
  })
})

describe('accesibilidad (axe) de la Etapa B', () => {
  it.each([
    ['Clientes', '/admin/clientes'],
    ['Inventario', '/admin/inventario'],
  ])('%s no tiene violaciones', { timeout: 30_000 }, async (_n, path) => {
    login()
    renderWithProviders(<AppRoutes />, path)
    await screen.findByRole('heading', { level: 1 }, { timeout: 15_000 })
    expect(await a11yViolations()).toEqual([])
  })

  it('reportes: cada pestaña y detalle de cliente', { timeout: 40_000 }, async () => {
    const user = userEvent.setup()
    login()
    const { unmount } = renderWithProviders(<AppRoutes />, '/admin/reportes')
    await screen.findByRole('heading', { level: 1, name: 'Reportes' }, { timeout: 15_000 })
    for (const tab of ['Ventas', 'Productos', 'Categorías y pagos']) {
      await user.click(screen.getByRole('tab', { name: tab }))
      expect(await a11yViolations(), `pestaña ${tab}`).toEqual([])
    }
    unmount()
    renderWithProviders(<AppRoutes />, '/admin/clientes')
    await screen.findByRole('heading', { level: 1, name: 'Clientes' }, { timeout: 15_000 })
    await user.click(within(screen.getAllByRole('row')[1]).getAllByRole('button')[0])
    expect(await a11yViolations()).toEqual([])
  })
})

describe('accesibilidad (axe) del panel admin', () => {
  it.each([
    ['Login', '/admin/login', false],
    ['Dashboard', '/admin', true],
    ['Productos', '/admin/productos', true],
    ['Importar', '/admin/importar', true],
    ['Pedidos', '/admin/pedidos', true],
    ['Categorías', '/admin/categorias', true],
    ['Apariencia', '/admin/apariencia', true],
    ['Configuración', '/admin/configuracion', true],
  ])('%s no tiene violaciones', { timeout: 30_000 }, async (_n, path, auth) => {
    if (auth) login()
    renderWithProviders(<AppRoutes />, path)
    await screen.findByRole('heading', { level: 1 }, { timeout: 15_000 })
    expect(await a11yViolations()).toEqual([])
  })
})
