import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/App'
import { getProductById } from '@/services/catalogService'
import { sampleCartItems } from '@/services/demoService'
import { renderWithProviders } from '@/test/renderWithProviders'
import { getVisited, markVisited, VISITED_KEY } from '@/utils/adminProgress'
import { hydrate } from '@/utils/cart'
import { buildDemoOrder } from '@/utils/demoOrder'
import { saveOrder } from '@/utils/orders'

const open = (path: string) => {
  window.localStorage.setItem('tienda-demo:admin-session', 'true')
  return renderWithProviders(<AppRoutes />, path)
}
const h1 = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 8000 })

describe('navegación y buscador global (Ctrl+K)', () => {
  it('el menú tiene el grupo Marketing con sus tres secciones', async () => {
    open('/admin')
    await h1('Inicio')
    const nav = screen.getByRole('navigation', { name: 'Panel administrador' })
    expect(within(nav).getByText('Marketing', { selector: 'p' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Cupones' })).toHaveAttribute(
      'href',
      '/admin/marketing/cupones',
    )
    expect(within(nav).getByRole('link', { name: 'Beneficios con bancos' })).toHaveAttribute(
      'href',
      '/admin/marketing/bancos',
    )
    expect(within(nav).getByRole('link', { name: 'Banners y destacados' })).toHaveAttribute(
      'href',
      '/admin/marketing/banners',
    )
  })

  it('Ctrl+K abre el buscador, encuentra un producto y Enter abre su editor', async () => {
    const user = userEvent.setup()
    open('/admin')
    await h1('Inicio')
    await user.keyboard('{Control>}k{/Control}')
    const dialog = screen.getByRole('dialog', { name: 'Buscador del panel' })
    expect(within(dialog).getByRole('combobox')).toHaveFocus()
    expect(within(dialog).getAllByRole('option').length).toBeGreaterThanOrEqual(8) // accesos rápidos a secciones
    await user.type(within(dialog).getByRole('combobox'), 'ideapad 3')
    expect(within(dialog).getByRole('group', { name: 'Productos' })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(await h1(/IdeaPad 3/)).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Buscador del panel' })).not.toBeInTheDocument()
  })

  it('flechas para moverse, Escape para cerrar, y empieza vacío en cada apertura', async () => {
    const user = userEvent.setup()
    open('/admin')
    await h1('Inicio')
    await user.click(screen.getByRole('button', { name: 'Buscar en el panel (Ctrl+K)' }))
    const box = screen.getByRole('combobox')
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowDown}')
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(screen.getAllByRole('option').at(-1)).toHaveAttribute('aria-selected', 'true') // da la vuelta
    await user.type(box, 'texto')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Buscador del panel' })).not.toBeInTheDocument()
    await user.keyboard('{Control>}k{/Control}')
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('busca pedidos y clientes, y muestra un mensaje si no hay resultados', async () => {
    const user = userEvent.setup()
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.6))
    open('/admin')
    await h1('Inicio')
    await user.keyboard('{Control>}k{/Control}')
    await user.type(screen.getByRole('combobox'), 'María Fernández')
    expect(screen.getByRole('group', { name: 'Clientes' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Pedidos' })).toBeInTheDocument()
    await user.clear(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'zzzzqq')
    expect(screen.getByText(/Sin resultados para «zzzzqq»/)).toBeInTheDocument()
  })

  it('al elegir una sección con el mouse navega a ella', async () => {
    const user = userEvent.setup()
    open('/admin')
    await h1('Inicio')
    await user.keyboard('{Control>}k{/Control}')
    await user.type(screen.getByRole('combobox'), 'cupones')
    await user.click(screen.getByRole('option', { name: /Cupones/ }))
    expect(await h1('Cupones')).toBeInTheDocument()
  })
})

describe('checklist de inicio', () => {
  it('muestra el progreso, marca los pasos al visitarlos y se puede ocultar', async () => {
    const user = userEvent.setup()
    const { unmount } = open('/admin')
    await h1('Inicio')
    const list = () => screen.getByRole('region', { name: 'Configurá tu tienda' })
    expect(within(list()).getByText('1 de 6 pasos completados')).toBeInTheDocument()
    expect(within(list()).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17')
    expect(within(list()).getByRole('link', { name: /Cargá tus productos/ })).toHaveTextContent(
      '(completado)',
    )
    expect(within(list()).getByRole('link', { name: /Creá tu primer cupón/ })).toHaveTextContent(
      '(pendiente)',
    )
    unmount()

    const second = open('/admin/marketing/cupones')
    await h1('Cupones')
    second.unmount()
    open('/admin')
    await h1('Inicio')
    expect(within(list()).getByText('2 de 6 pasos completados')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ocultar la guía de inicio' }))
    expect(screen.queryByRole('region', { name: 'Configurá tu tienda' })).not.toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('tienda-demo:admin-checklist-hidden')!)).toBe(
      true,
    )
  })

  it('la venta de prueba completa el último paso', async () => {
    saveOrder(buildDemoOrder(hydrate(sampleCartItems(), getProductById), new Date(), () => 0.7))
    open('/admin')
    await h1('Inicio')
    expect(
      within(screen.getByRole('region', { name: 'Configurá tu tienda' })).getByRole('link', {
        name: /Hacé una venta de prueba/,
      }),
    ).toHaveTextContent('(completado)')
  })

  it('markVisited acumula sin duplicar y tolera datos corruptos', () => {
    markVisited('cupones')
    markVisited('cupones')
    markVisited('banners')
    expect(getVisited()).toEqual(['cupones', 'banners'])
    window.localStorage.setItem(VISITED_KEY, '"basura"')
    expect(getVisited()).toEqual([])
  })
})

describe('cupones', () => {
  it('lista los cupones de ejemplo con todos los estados y un resumen', async () => {
    open('/admin/marketing/cupones')
    await h1('Cupones')
    expect(screen.getAllByRole('row')).toHaveLength(9) // encabezado + 8
    for (const s of ['Activo', 'Programado', 'Vencido', 'Agotado', 'Pausado'])
      expect(screen.getAllByText(s).length).toBeGreaterThan(0)
    expect(screen.getByText('BIENVENIDA10')).toBeInTheDocument()
    expect(screen.getByText('Cupones activos')).toBeInTheDocument()
  })

  it('crear un cupón: valida, muestra la vista previa y lo agrega a la lista (solo en pantalla)', async () => {
    const user = userEvent.setup()
    open('/admin/marketing/cupones')
    await h1('Cupones')
    await user.click(screen.getByRole('button', { name: 'Nuevo cupón' }))
    const dialog = screen.getByRole('dialog', { name: 'Nuevo cupón' })
    await user.click(within(dialog).getByRole('button', { name: 'Crear cupón' }))
    expect(within(dialog).getByText(/entre 4 y 20 letras/)).toBeInTheDocument()
    expect(within(dialog).getByText('Elegí la fecha de fin')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Código'), 'bienvenida10')
    await user.type(within(dialog).getByLabelText('Hasta'), '2026-12-31')
    await user.click(within(dialog).getByRole('button', { name: 'Crear cupón' }))
    expect(within(dialog).getByText(/Ya existe un cupón con ese código/)).toBeInTheDocument()

    await user.clear(within(dialog).getByLabelText('Código'))
    await user.type(within(dialog).getByLabelText('Código'), 'verano20')
    await user.clear(within(dialog).getByLabelText('Porcentaje (%)'))
    await user.type(within(dialog).getByLabelText('Porcentaje (%)'), '20')
    expect(within(dialog).getByText(/20% de descuento/)).toBeInTheDocument()
    await user.selectOptions(within(dialog).getByLabelText('Aplica a'), 'moda')
    expect(within(dialog).getByText(/solo en Moda/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Crear cupón' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('VERANO20')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(10)
    expect(screen.getAllByText('Cupón creado (solo en esta pantalla)').length).toBeGreaterThan(0)
  })

  it('el tipo "envío gratis" no pide valor y el interruptor pausa el cupón', async () => {
    const user = userEvent.setup()
    open('/admin/marketing/cupones')
    await h1('Cupones')
    await user.click(screen.getByRole('button', { name: 'Nuevo cupón' }))
    await user.selectOptions(screen.getByLabelText('Tipo de descuento'), 'free-shipping')
    expect(screen.queryByLabelText('Porcentaje (%)')).not.toBeInTheDocument()
    await user.keyboard('{Escape}')

    const row = screen.getAllByRole('row').find((r) => within(r).queryByText('BIENVENIDA10'))!
    expect(within(row).getByText('Activo')).toBeInTheDocument()
    await user.click(within(row).getByRole('switch', { name: 'Pausar el cupón BIENVENIDA10' }))
    expect(within(row).getByText('Pausado')).toBeInTheDocument()
  })
})

describe('beneficios con bancos', () => {
  it('lista los beneficios y muestra la vista previa de la Home', async () => {
    open('/admin/marketing/bancos')
    await h1('Beneficios con bancos')
    const preview = screen.getByRole('region', { name: 'Beneficios con tu banco o cooperativa' })
    expect(within(preview).getAllByRole('listitem')).toHaveLength(4)
    expect(within(preview).getByText('Banco Meridiano')).toBeInTheDocument()
  })

  it('ocultar, editar, agregar y quitar actualizan la vista previa', async () => {
    const user = userEvent.setup()
    open('/admin/marketing/bancos')
    await h1('Beneficios con bancos')
    const preview = () =>
      within(screen.getByRole('region', { name: 'Beneficios con tu banco o cooperativa' }))

    await user.click(screen.getByRole('switch', { name: 'Mostrar Banco Sol en la tienda' }))
    expect(preview().queryByText('Banco Sol')).not.toBeInTheDocument()
    expect(preview().getAllByRole('listitem')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Editar Banco Meridiano' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar beneficio' })
    await user.clear(within(dialog).getByLabelText('Beneficio destacado'))
    await user.type(within(dialog).getByLabelText('Beneficio destacado'), '20% OFF')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar beneficio' }))
    expect(preview().getByText('20% OFF')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agregar beneficio' }))
    await user.click(screen.getByRole('button', { name: 'Guardar beneficio' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Completá el nombre')
    await user.type(screen.getByLabelText('Banco o cooperativa'), 'Coop. Sur')
    await user.type(screen.getByLabelText('Beneficio destacado'), '6 cuotas')
    expect(
      within(screen.getByRole('group', { name: 'Vista previa de la tarjeta' })).getByText(
        'Coop. Sur',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar beneficio' }))
    expect(preview().getByText('Coop. Sur')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar Coop. Sur' }))
    expect(preview().queryByText('Coop. Sur')).not.toBeInTheDocument()
  })
})

describe('banners y destacados', () => {
  it('el banner principal sigue lo que se escribe', async () => {
    const user = userEvent.setup()
    open('/admin/marketing/banners')
    await h1('Banners y destacados')
    const preview = within(
      screen.getByRole('region', { name: 'Vista previa del banner principal' }),
    )
    expect(preview.getByText('Hasta 18 cuotas sin interés en toda la tienda')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Título'))
    await user.type(screen.getByLabelText('Título'), 'Súper ofertas de octubre')
    await user.clear(screen.getByLabelText('Texto del botón'))
    await user.type(screen.getByLabelText('Texto del botón'), 'Aprovechar')
    expect(preview.getByText('Súper ofertas de octubre')).toBeInTheDocument()
    expect(preview.getByText('Aprovechar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar banner' }))
    expect(
      screen.getAllByText('Los cambios no se guardan: es una demostración').length,
    ).toBeGreaterThan(0)
  })

  it('destacados: reordenar, quitar y agregar con tope de 8', async () => {
    const user = userEvent.setup()
    open('/admin/marketing/banners')
    await h1('Banners y destacados')
    await user.click(screen.getByRole('tab', { name: 'Productos destacados' }))
    const list = () => screen.getByRole('list', { name: 'Orden de los destacados' })
    const names = () =>
      within(list())
        .getAllByRole('listitem')
        .map((li) => li.querySelector('.font-semibold')!.textContent)
    expect(names()).toHaveLength(8)
    const [first, second] = names()

    await user.click(screen.getByRole('button', { name: `Bajar ${first}` }))
    expect(names().slice(0, 2)).toEqual([second, first])
    expect(screen.getByRole('button', { name: `Subir ${second}` })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: `Quitar ${second} de los destacados` }))
    expect(names()).toHaveLength(7)
    expect(screen.getByRole('button', { name: /Agregar/ })).toBeDisabled() // sin elegir producto

    await user.selectOptions(
      screen.getByLabelText('Agregar producto'),
      screen.getAllByRole('option')[1] as HTMLOptionElement,
    )
    await user.click(screen.getByRole('button', { name: /^Agregar$/ }))
    expect(names()).toHaveLength(8)
    expect(screen.getByLabelText('Agregar producto')).toBeDisabled()
  })
})

describe('configuración', () => {
  it('tiene 5 pestañas y General edita horarios', async () => {
    const user = userEvent.setup()
    open('/admin/configuracion')
    await h1('Configuración')
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'General',
      'Envíos',
      'Pagos',
      'Impuestos',
      'Usuarios y roles',
    ])
    expect(screen.getByLabelText('WhatsApp (con código de país)')).toHaveValue('+595981234567')
    const sunday = screen.getByRole('switch', { name: 'Domingos y feriados' })
    expect(sunday).not.toBeChecked()
    await user.click(sunday)
    expect(screen.getByText('Abierto de 09:00 a 12:00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(
      screen.getAllByText('Los cambios no se guardan: es una demostración').length,
    ).toBeGreaterThan(0)
  })

  it('envíos: zonas editables, agregar y quitar; retiro en sucursal', async () => {
    const user = userEvent.setup()
    open('/admin/configuracion')
    await h1('Configuración')
    await user.click(screen.getByRole('tab', { name: 'Envíos' }))
    const table = screen.getByRole('table', { name: 'Zonas de envío' })
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: 'Agregar zona' }))
    expect(within(table).getAllByRole('row')).toHaveLength(5)
    await user.click(screen.getByRole('button', { name: 'Quitar Zonas remotas' }))
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(screen.getByRole('checkbox', { name: /Asunción Centro/ })).toBeChecked()
    await user.click(screen.getByRole('switch', { name: 'Permitir retiro en sucursal' }))
    expect(screen.queryByRole('checkbox', { name: /Asunción Centro/ })).not.toBeInTheDocument()
  })

  it('pagos: cada medio muestra sus opciones solo si está activo', async () => {
    const user = userEvent.setup()
    open('/admin/configuracion')
    await h1('Configuración')
    await user.click(screen.getByRole('tab', { name: 'Pagos' }))
    expect(screen.getByLabelText('Máximo de cuotas')).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Aceptar tarjetas' }))
    expect(screen.queryByLabelText('Máximo de cuotas')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Cuenta corriente')).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Aceptar transferencias' }))
    expect(screen.queryByLabelText('Cuenta corriente')).not.toBeInTheDocument()
  })

  it('impuestos: calcula el IVA según la tasa y si el precio lo incluye', async () => {
    const user = userEvent.setup()
    open('/admin/configuracion')
    await h1('Configuración')
    await user.click(screen.getByRole('tab', { name: 'Impuestos' }))
    expect(
      screen.getByText(/incluye Gs\. 10\.000 de IVA \(neto Gs\. 100\.000\)/),
    ).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Tasa general'), '5')
    expect(screen.getByText(/incluye Gs\. 5\.238 de IVA/)).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Los precios ya incluyen IVA' }))
    expect(screen.getByText(/se cobra Gs\. 115\.500 al cliente/)).toBeInTheDocument()
  })

  it('usuarios: invitar con validación, cambiar rol y tabla de permisos accesible', async () => {
    const user = userEvent.setup()
    open('/admin/configuracion')
    await h1('Configuración')
    await user.click(screen.getByRole('tab', { name: 'Usuarios y roles' }))
    const users = screen.getByRole('table', { name: 'Usuarios del panel' })
    expect(within(users).getAllByRole('row')).toHaveLength(5)
    expect(
      within(users).getByRole('combobox', { name: 'Rol de Administrador demo' }),
    ).toBeDisabled()
    await user.selectOptions(
      within(users).getByRole('combobox', { name: 'Rol de Carlos Ramírez' }),
      'Inventario',
    )
    expect(within(users).getByRole('combobox', { name: 'Rol de Carlos Ramírez' })).toHaveValue(
      'Inventario',
    )

    await user.click(screen.getByRole('button', { name: 'Invitar usuario' }))
    const dialog = screen.getByRole('dialog', { name: 'Invitar usuario' })
    await user.click(within(dialog).getByRole('button', { name: 'Enviar invitación' }))
    expect(within(dialog).getByText('Ingresá un email válido')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Email'), 'nueva@persona.com')
    await user.click(within(dialog).getByRole('button', { name: 'Enviar invitación' }))
    expect(within(users).getAllByRole('row')).toHaveLength(6)
    expect(within(users).getAllByText('Invitación pendiente').length).toBeGreaterThan(0)

    const perms = screen.getByRole('table', { name: 'Permisos por rol' })
    const row = within(perms).getByRole('row', { name: /Usuarios y roles/ })
    expect(within(row).getAllByText('Sí')).toHaveLength(1)
    expect(within(row).getAllByText('No')).toHaveLength(3)
  })
})

describe('apariencia: marca y vista previa', () => {
  it('color propio: avisa del contraste del texto blanco y se puede restablecer', async () => {
    const user = userEvent.setup()
    open('/admin/apariencia')
    await h1('Apariencia')
    const status = () => within(screen.getByRole('main')).getByRole('status')
    expect(status()).toHaveTextContent(/Buen contraste/)
    fireEvent.change(screen.getByLabelText('Color principal propio'), {
      target: { value: '#ffe600' },
    })
    expect(status()).toHaveTextContent(/Contraste bajo/)
    expect(screen.getByText('#FFE600')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restablecer' }))
    expect(status()).toHaveTextContent(/Buen contraste/)
  })

  it('el logo subido reemplaza al texto en la vista previa y se puede quitar', async () => {
    const user = userEvent.setup()
    URL.createObjectURL = vi.fn(() => 'blob:logo-demo')
    URL.revokeObjectURL = vi.fn()
    open('/admin/apariencia')
    await h1('Apariencia')
    const preview = within(screen.getByRole('group', { name: 'Vista previa' }))
    expect(preview.getByText('TIENDA DEMO')).toBeInTheDocument()
    await user.upload(
      screen.getByLabelText('Subir logo'),
      new File(['x'], 'logo.png', { type: 'image/png' }),
    )
    expect(preview.getByRole('img', { name: 'Logo de TIENDA DEMO' })).toHaveAttribute(
      'src',
      'blob:logo-demo',
    )
    await user.click(screen.getByRole('button', { name: 'Quitar logo' }))
    expect(preview.getByText('TIENDA DEMO')).toBeInTheDocument()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:logo-demo')
  })

  it('elegir una paleta quita el color propio', async () => {
    const user = userEvent.setup()
    open('/admin/apariencia')
    await h1('Apariencia')
    fireEvent.change(screen.getByLabelText('Color principal propio'), {
      target: { value: '#ffe600' },
    })
    await user.click(screen.getByRole('radio', { name: 'Verde' }))
    expect(screen.queryByRole('button', { name: 'Restablecer' })).not.toBeInTheDocument()
  })
})
