import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppProviders } from '@/context/AppProviders'
import { DEMO_BAR_STORAGE_KEY } from '@/services/demoService'
import { listOrders } from '@/utils/orders'
import { hardNavigate } from '@/utils/navigation'
import { demoScreens } from '@/config/demoScreens'
import { DemoBar } from './DemoBar'

vi.mock('@/utils/navigation', () => ({ hardNavigate: vi.fn() }))

function Where() {
  const l = useLocation()
  return <output data-testid="url">{l.pathname + l.search}</output>
}

function setup(route = '/') {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>
        <DemoBar />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}
const url = () => screen.getByTestId('url').textContent
const nav = () => screen.getByRole('navigation', { name: 'Navegación de la demo' })

afterEach(() => {
  window.history.pushState({}, '', '/')
  window.sessionStorage.clear()
  document.documentElement.style.removeProperty('--demo-bar-h')
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('DemoBar', () => {
  it('ofrece las 8 pantallas y resalta la actual', () => {
    setup('/categoria/notebooks')
    expect(within(nav()).getAllByRole('listitem')).toHaveLength(demoScreens.length)
    expect(within(nav()).getByRole('link', { name: 'Categoría' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav()).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current')
  })

  it.each([
    ['Inicio', '/'],
    ['Categoría', '/categoria/notebooks'],
    ['Búsqueda', '/buscar?q=lenovo'],
    ['Admin', '/admin'],
  ])('"%s" navega a %s', async (label, to) => {
    const user = userEvent.setup()
    setup('/zzz')
    await user.click(within(nav()).getByRole('link', { name: label }))
    expect(url()).toBe(to)
  })

  it('Producto abre una ficha existente con colores', async () => {
    const user = userEvent.setup()
    setup('/zzz')
    await user.click(within(nav()).getByRole('link', { name: 'Producto' }))
    expect(url()).toMatch(/^\/producto\/notebook-lenovo/)
  })

  it('Carrito y Checkout llenan el carrito vacío, sin duplicar si ya tiene productos', async () => {
    const user = userEvent.setup()
    setup('/zzz')
    await user.click(within(nav()).getByRole('button', { name: 'Checkout' }))
    expect(url()).toBe('/checkout')
    const first = JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)
    expect(first).toHaveLength(2)
    await user.click(within(nav()).getByRole('button', { name: 'Carrito' }))
    expect(url()).toBe('/carrito')
    expect(JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)).toEqual(first)
  })

  it('Confirmación crea un pedido de ejemplo una vez y navega a él', async () => {
    const user = userEvent.setup()
    setup('/zzz')
    await user.click(within(nav()).getByRole('button', { name: 'Confirmación' }))
    const [order] = listOrders()
    expect(url()).toBe(`/pedido/${order.id}`)
    await user.click(within(nav()).getByRole('button', { name: 'Confirmación' }))
    expect(listOrders()).toHaveLength(1)
  })

  it('ocultar persiste, aparece la pestaña "Demo" y se puede volver a mostrar', async () => {
    const user = userEvent.setup()
    setup()
    expect(document.documentElement.style.getPropertyValue('--demo-bar-h')).toBe('40px')
    await user.click(screen.getByRole('button', { name: 'Ocultar barra de demo' }))
    expect(
      screen.queryByRole('navigation', { name: 'Navegación de la demo' }),
    ).not.toBeInTheDocument()
    expect(document.documentElement.style.getPropertyValue('--demo-bar-h')).toBe('0px')
    expect(JSON.parse(window.localStorage.getItem(DEMO_BAR_STORAGE_KEY)!)).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Mostrar barra de demo' }))
    expect(nav()).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(DEMO_BAR_STORAGE_KEY)!)).toBe(false)
  })

  it('arranca oculta si el usuario la había ocultado antes', () => {
    window.localStorage.setItem(DEMO_BAR_STORAGE_KEY, 'true')
    setup()
    expect(screen.getByRole('button', { name: 'Mostrar barra de demo' })).toBeInTheDocument()
  })

  it('?demo=0 la oculta solo en la sesión y ?demo=1 la restablece', () => {
    window.history.pushState({}, '', '/?demo=0')
    const { unmount } = setup()
    expect(screen.getByRole('button', { name: 'Mostrar barra de demo' })).toBeInTheDocument()
    expect(window.localStorage.getItem(DEMO_BAR_STORAGE_KEY)).toBeNull() // no es permanente
    unmount()

    window.history.pushState({}, '', '/')
    setup() // la sesión sigue oculta
    expect(screen.getByRole('button', { name: 'Mostrar barra de demo' })).toBeInTheDocument()
    document.body.innerHTML = ''

    window.history.pushState({}, '', '/?demo=1')
    setup()
    expect(nav()).toBeInTheDocument()
  })

  it('VITE_DEMO_BAR=false la elimina por completo', () => {
    vi.stubEnv('VITE_DEMO_BAR', 'false')
    setup()
    expect(
      screen.queryByRole('navigation', { name: 'Navegación de la demo' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mostrar barra de demo' })).not.toBeInTheDocument()
    expect(document.documentElement.style.getPropertyValue('--demo-bar-h')).toBe('0px')
  })

  it('cambia la paleta de la tienda', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('radio', { name: 'Paleta Verde' }))
    expect(document.documentElement.dataset.theme).toBe('verde')
  })

  it('Reiniciar pide confirmación: cancelar no borra, confirmar limpia y recarga el inicio', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('tienda-demo:cart', '[{"productId":"p001","quantity":1}]')
    window.localStorage.setItem(DEMO_BAR_STORAGE_KEY, 'false')
    setup()

    await user.click(screen.getByRole('button', { name: /Reiniciar demo/ }))
    const dialog = screen.getByRole('alertdialog', { name: '¿Reiniciar la demo?' })
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('tienda-demo:cart')).not.toBeNull()
    expect(hardNavigate).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /Reiniciar demo/ }))
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Reiniciar' }),
    )
    expect(window.localStorage.getItem('tienda-demo:cart')).toBeNull()
    expect(window.localStorage.getItem(DEMO_BAR_STORAGE_KEY)).toBe('false')
    expect(hardNavigate).toHaveBeenCalledWith('/')
  })
})
