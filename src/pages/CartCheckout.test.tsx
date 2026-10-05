import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { getProduct } from '@/services/catalogService'
import { renderWithProviders } from '@/test/renderWithProviders'
import { listOrders } from '@/utils/orders'
import Cart from './Cart'
import Checkout from './Checkout'
import OrderDone from './OrderDone'

const lenovo = getProduct('notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd')!
const mochila = getProduct('mochila-porta-notebook-15-6')!

const seedCart = (items: { productId: string; colorName?: string; quantity: number }[]) =>
  window.localStorage.setItem('tienda-demo:cart', JSON.stringify(items))

const app = (
  <>
    <Header />
    <Routes>
      <Route path="carrito" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="pedido/:id" element={<OrderDone />} />
      <Route path="*" element={<p>otra ruta</p>} />
    </Routes>
  </>
)

describe('Carrito', () => {
  it('vacío: estado vacío con enlace para explorar', () => {
    renderWithProviders(app, '/carrito')
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar productos' })).toHaveAttribute(
      'href',
      '/buscar',
    )
  })

  it('lista líneas, permite cambiar cantidad, quitar y vaciar; totales reales', async () => {
    const user = userEvent.setup()
    seedCart([
      { productId: lenovo.id, colorName: 'Azul Abismo', quantity: 1 },
      { productId: mochila.id, colorName: mochila.colors[0].name, quantity: 1 },
    ])
    renderWithProviders(app, '/carrito')
    const summary = screen.getByRole('complementary', { name: 'Resumen' })
    expect(within(summary).getAllByText('Gs. 4.839.000')).toHaveLength(2) // subtotal y total
    expect(within(summary).getByText('¡Tenés envío gratis!')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Aumentar cantidad' })[0])
    expect(screen.getByRole('button', { name: 'Carrito, 3 productos' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: `Quitar ${mochila.name} del carrito` }))
    expect(screen.queryByText(mochila.name)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)).toEqual([])
  })

  it('muestra cuánto falta para el envío gratis', () => {
    seedCart([{ productId: mochila.id, colorName: mochila.colors[0].name, quantity: 1 }])
    renderWithProviders(app, '/carrito')
    expect(screen.getByText(/Te faltan/)).toHaveTextContent('Gs. 251.000')
  })

  it('el mini-carrito se abre desde el header', async () => {
    const user = userEvent.setup()
    seedCart([{ productId: lenovo.id, colorName: 'Azul Abismo', quantity: 2 }])
    renderWithProviders(app, '/otra')
    await user.click(screen.getByRole('button', { name: 'Carrito, 2 productos' }))
    const dialog = screen.getByRole('dialog', { name: 'Tu carrito (2)' })
    expect(
      within(dialog).getByText('Gs. 9.180.000', { selector: 'span.text-xl' }),
    ).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Finalizar compra' })).toHaveAttribute(
      'href',
      '/checkout',
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Checkout', () => {
  it('sin productos muestra el estado vacío', () => {
    renderWithProviders(app, '/checkout')
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
  })

  it(
    'flujo completo con tarjeta: valida, confirma, guarda el pedido y vacía el carrito',
    { timeout: 20_000 },
    async () => {
      const user = userEvent.setup()
      seedCart([
        { productId: lenovo.id, colorName: 'Azul Abismo', quantity: 1 },
        { productId: mochila.id, colorName: mochila.colors[0].name, quantity: 1 },
      ])
      renderWithProviders(app, '/checkout')

      // Paso 1: el botón del resumen está deshabilitado y el formulario valida
      expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Continuar al pago' }))
      expect(screen.getByText('Ingresá nombre y apellido')).toBeInTheDocument()

      await user.type(screen.getByLabelText('Nombre y apellido'), 'María Fernández')
      await user.type(screen.getByLabelText('Teléfono'), '0981 234 567')
      await user.type(screen.getByLabelText('Dirección'), 'Mcal. López 1234')
      await user.type(screen.getByLabelText('Ciudad'), 'Asunción')
      await user.selectOptions(screen.getByLabelText('Departamento'), 'Central')
      await user.type(screen.getByLabelText('Código postal'), '1209')
      await user.click(screen.getByRole('button', { name: 'Continuar al pago' }))

      // Paso 2: resumen colapsado del paso 1 y formulario de pago
      expect(screen.getByText(/María Fernández — Mcal. López 1234, Asunción/)).toBeInTheDocument()
      expect(screen.getByText(/Central · CP 1209 · Tel. 0981 234 567/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled() // faltan términos

      await user.click(screen.getByRole('checkbox', { name: /Acepto los términos/ }))
      await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
      expect(screen.getByText('Número de tarjeta inválido')).toBeInTheDocument() // tarjeta vacía

      await user.type(screen.getByLabelText('Número de tarjeta'), '4242424242424242')
      expect(screen.getByLabelText('Número de tarjeta')).toHaveValue('4242 4242 4242 4242')
      await user.type(screen.getByLabelText('Nombre en la tarjeta'), 'MARIA FERNANDEZ')
      await user.type(screen.getByLabelText('Vencimiento'), '1239')
      await user.type(screen.getByLabelText('CVV'), '123')
      await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

      // Confirmación
      expect(
        await screen.findByRole('heading', { name: '¡Pedido confirmado!' }),
      ).toBeInTheDocument()
      expect(screen.getByText(/no se realizó ningún cobro/)).toBeInTheDocument()
      expect(screen.getByText(/Tarjeta terminada en 4242 · 3 cuotas/)).toBeInTheDocument()

      const [order] = listOrders()
      expect(order.total).toBe(4839000)
      expect(order.shipping).toBe(0)
      expect(order.payment.cardLast4).toBe('4242')
      expect(JSON.stringify(order)).not.toContain('4242 4242') // nunca se guarda el número completo
      expect(JSON.stringify(order)).not.toContain('"123"')
      expect(JSON.parse(window.localStorage.getItem('tienda-demo:cart')!)).toEqual([])
    },
  )

  it('retiro en sucursal: sin costo de envío y exige sucursal', async () => {
    const user = userEvent.setup()
    seedCart([{ productId: mochila.id, colorName: mochila.colors[0].name, quantity: 1 }])
    renderWithProviders(app, '/checkout')
    expect(screen.getByText('Gs. 25.000')).toBeInTheDocument() // bajo el umbral: tarifa de envío

    await user.click(screen.getByRole('radio', { name: 'Retiro en sucursal' }))
    expect(screen.getByText('Gratis')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Nombre y apellido'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Teléfono'), '0981234567')
    await user.click(screen.getByRole('button', { name: 'Continuar al pago' }))
    expect(screen.getByText('Elegí la sucursal de retiro')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Sucursal de retiro'), 'san-lorenzo')
    await user.click(screen.getByRole('button', { name: 'Continuar al pago' }))
    expect(screen.getByText(/Retiro en sucursal San Lorenzo/)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Efectivo en sucursal' }))
    await user.click(screen.getByRole('checkbox', { name: /Acepto los términos/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(await screen.findByText(/Efectivo en sucursal/)).toBeInTheDocument()
  })

  it('el pedido de otro navegador no existe: mensaje claro', () => {
    renderWithProviders(app, '/pedido/PED-NADA')
    expect(screen.getByText('No encontramos ese pedido')).toBeInTheDocument()
  })
})
