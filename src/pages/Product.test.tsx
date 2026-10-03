import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/renderWithProviders'
import Product from './Product'

function Url() {
  const l = useLocation()
  return <output data-testid="url">{l.pathname + l.search}</output>
}
const app = (
  <>
    <Routes>
      <Route path="producto/:slug" element={<Product />} />
      <Route path="checkout" element={<p>pantalla checkout</p>} />
    </Routes>
    <Url />
  </>
)
const LENOVO = '/producto/notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd'

describe('Detalle de producto', () => {
  it('muestra los datos del mockup', () => {
    renderWithProviders(app, LENOVO)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Notebook Lenovo IdeaPad 3 15" Ryzen 5 8GB 256GB SSD')
    const detail = within(h1.parentElement!)
    expect(detail.getByText('4.6 (128 opiniones)')).toBeInTheDocument()
    expect(detail.getByText('Gs. 5.190.000')).toBeInTheDocument()
    expect(detail.getByText('Gs. 4.590.000')).toBeInTheDocument()
    expect(detail.getByText('Ahorrás Gs. 600.000')).toBeInTheDocument()
    expect(detail.getByText('12 cuotas de Gs. 382.500 sin interés')).toBeInTheDocument()
    expect(detail.getByText(/En stock — Envío en 24 a 48hs/)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toHaveTextContent(
      'Inicio›Informática›Notebooks›Notebook Lenovo',
    )
    expect(screen.getAllByRole('article')).toHaveLength(4) // relacionados
    expect(document.title).toMatch(/^Notebook Lenovo IdeaPad 3/)
  })

  it('cambiar de color actualiza URL, SKU y selección', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, LENOVO)
    const detail = screen.getByRole('heading', { level: 1 }).parentElement!
    const first = within(detail).getByText(/SKU/).textContent
    await user.click(within(detail).getByRole('button', { name: /Color Negro/ }))
    expect(screen.getByTestId('url').textContent).toBe(`${LENOVO}?color=Negro`)
    expect(
      within(detail).getByText('Negro', { selector: 'span.font-semibold' }),
    ).toBeInTheDocument()
    expect(within(detail).getByText(/SKU/).textContent).not.toBe(first)
  })

  it('respeta ?color= de la URL', () => {
    renderWithProviders(app, `${LENOVO}?color=Negro`)
    expect(screen.getByRole('button', { name: /Color Negro/, pressed: true })).toBeInTheDocument()
  })

  it('cantidad limitada por stock y agrega esa cantidad al carrito', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, LENOVO)
    const detail = screen.getByRole('heading', { level: 1 }).parentElement!
    expect(within(detail).getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled()
    await user.click(within(detail).getByRole('button', { name: 'Aumentar cantidad' }))
    await user.click(within(detail).getByRole('button', { name: 'Aumentar cantidad' }))
    expect(within(detail).getByRole('group', { name: 'Cantidad' })).toHaveTextContent('3')
    await user.click(within(detail).getByRole('button', { name: 'Agregar al carrito' }))
    const stored = JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].quantity).toBe(3)
  })

  it('"Comprar ahora" agrega y navega al checkout', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, LENOVO)
    await user.click(screen.getByRole('button', { name: 'Comprar ahora' }))
    expect(screen.getByText('pantalla checkout')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)).toHaveLength(1)
  })

  it('producto sin stock: no se puede comprar', () => {
    renderWithProviders(app, '/producto/joystick-inalambrico-para-consola')
    expect(screen.getByText('Sin stock por el momento')).toBeInTheDocument()
    const detail = within(screen.getByRole('heading', { level: 1 }).parentElement!)
    expect(detail.getByRole('button', { name: 'Agregar al carrito' })).toBeDisabled()
    expect(detail.getByRole('button', { name: 'Comprar ahora' })).toBeDisabled()
  })

  it('pestañas: descripción, especificaciones y opiniones con teclado', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, LENOVO)
    expect(screen.getByRole('tab', { name: 'Descripción' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.click(screen.getByRole('tab', { name: 'Especificaciones' }))
    expect(screen.getByRole('table', { name: /Especificaciones de/ })).toBeInTheDocument()
    expect(within(screen.getByRole('tabpanel')).getByText('AMD Ryzen 5')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Opiniones (128)' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('128 opiniones')).toBeInTheDocument()
    expect(screen.getByText(/Opiniones de ejemplo/)).toBeInTheDocument()
  })

  it('en USD formatea precios y cuotas', () => {
    window.localStorage.setItem('tienda-demo:currency', '"USD"')
    renderWithProviders(app, LENOVO)
    expect(screen.getByText('USD 628,77')).toBeInTheDocument()
    expect(screen.getByText('12 cuotas de USD 52,40 sin interés')).toBeInTheDocument()
  })

  it('slug inexistente muestra 404', () => {
    renderWithProviders(app, '/producto/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })
})
