import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/Header'
import { CurrencySwitch } from '@/components/layout/CurrencySwitch'
import { renderWithProviders } from '@/test/renderWithProviders'
import { getProduct } from '@/services/catalogService'
import { ProductCard } from './ProductCard'

const lenovo = getProduct('notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd')!
const joystick = getProduct('joystick-inalambrico-para-consola')!

describe('ProductCard', () => {
  it('muestra oferta, precios y cuotas del mockup', () => {
    renderWithProviders(<ProductCard product={lenovo} showBrand />)
    expect(screen.getByText('OFERTA')).toBeInTheDocument()
    expect(screen.getByText('Gs. 5.190.000')).toBeInTheDocument()
    expect(screen.getByText('Gs. 4.590.000')).toBeInTheDocument()
    expect(screen.getByText('12 cuotas de Gs. 382.500')).toBeInTheDocument()
    expect(screen.getByText('Lenovo')).toBeInTheDocument()
  })

  it('agrega al carrito con el color elegido y actualiza el badge del header', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Header />
        <ProductCard product={lenovo} />
      </>,
    )
    await user.click(screen.getByRole('button', { name: /Color Negro/ }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(screen.getByRole('button', { name: 'Carrito, 2 productos' })).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)).toEqual([
      { productId: lenovo.id, colorName: 'Negro', quantity: 2 },
    ])
    expect(screen.getAllByText('Agregado al carrito').length).toBeGreaterThan(0)
  })

  it('el enlace conserva el color elegido', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductCard product={lenovo} />)
    await user.click(screen.getByRole('button', { name: /Color Negro/ }))
    expect(screen.getByRole('link', { name: lenovo.name })).toHaveAttribute(
      'href',
      expect.stringContaining('color=Negro'),
    )
  })

  it('sin stock: botón deshabilitado', () => {
    renderWithProviders(<ProductCard product={joystick} />)
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled()
  })

  it('cambia de moneda desde el selector de moneda y reformatea precios', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <CurrencySwitch />
        <ProductCard product={lenovo} />
      </>,
    )
    await user.click(screen.getByRole('radio', { name: 'USD' }))
    expect(screen.getByText('USD 628,77')).toBeInTheDocument()
    expect(screen.getByText('12 cuotas de USD 52,40')).toBeInTheDocument()
    expect(window.localStorage.getItem('tienda-demo:currency')).toBe('"USD"')
  })
})
