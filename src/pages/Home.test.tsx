import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import Home from './Home'

describe('Home', () => {
  it('muestra hero, 4 beneficios bancarios y los 8 destacados con datos del mockup', () => {
    renderWithProviders(<Home />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Hasta 18 cuotas sin interés en toda la tienda',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver ofertas' })).toHaveAttribute(
      'href',
      '/buscar?ofertas=1',
    )

    const banks = screen
      .getByRole('heading', { name: /Beneficios con tu banco/ })
      .closest('section')!
    expect(within(banks).getAllByRole('listitem')).toHaveLength(4)
    expect(within(banks).getByText('Coop. Unión Paraguaya')).toBeInTheDocument()

    const featured = screen
      .getByRole('heading', { name: 'Productos destacados' })
      .closest('section')!
    expect(within(featured).getAllByRole('article')).toHaveLength(8)
    expect(within(featured).getByText('Gs. 332.700', { exact: false })).toBeInTheDocument()
    expect(
      screen.getByText(/Envío gratis en compras superiores a Gs\. 500\.000/),
    ).toBeInTheDocument()
  })

  it('muestra las categorías como accesos en la portada (sin barra lateral)', () => {
    renderWithProviders(<Home />)
    const nav = screen.getByRole('navigation', { name: 'Comprar por categoría' })
    expect(within(nav).getAllByRole('link')).toHaveLength(10)
    expect(within(nav).getByRole('link', { name: 'Herramientas y Obra' })).toHaveAttribute(
      'href',
      '/categoria/ferreteria-y-construccion',
    )
    expect(screen.queryByRole('complementary', { name: 'Categorías' })).toBeNull()
  })

  it('muestra ofertas en el banner y en "Ofertas de la semana" sin repetir productos', () => {
    renderWithProviders(<Home />)
    const row = screen.getByRole('heading', { name: 'Ofertas de la semana' }).closest('section')!
    const rowNames = within(row)
      .getAllByRole('article')
      .map((a) => within(a).getAllByRole('link')[0].textContent)
    expect(rowNames).toHaveLength(4)
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!
    const heroLinks = within(hero).getAllByRole('link', { name: /Gs\./ })
    expect(heroLinks).toHaveLength(3)
    for (const l of heroLinks)
      for (const n of rowNames) expect(l.textContent).not.toContain(n ?? '')
  })

  it('el envío gratis sigue la moneda elegida', () => {
    window.localStorage.setItem('tienda-demo:currency', '"USD"')
    renderWithProviders(<Home />)
    expect(screen.getByText(/superiores a USD 68,49/)).toBeInTheDocument()
  })

  it('newsletter: valida el email y confirma la suscripción simulada', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)
    await user.click(screen.getByRole('button', { name: 'Suscribirme' }))
    expect(screen.getByRole('alert')).toHaveTextContent('email válido')

    await user.type(screen.getByLabelText('Tu email'), 'persona@correo.com')
    await user.click(screen.getByRole('button', { name: 'Suscribirme' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(/Suscripción simulada/)).toBeInTheDocument()
    expect(screen.getByLabelText('Tu email')).toHaveValue('')
  })
})
