import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from './context/AppProviders'
import { AppRoutes } from './App'
import { brand } from './config/brand'

const renderAt = (path: string) =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  )

describe('rutas', () => {
  it('muestra el nombre de la marca desde brand.ts', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: brand.logoText })).toBeInTheDocument()
    expect(document.title).toBe(brand.name)
  })

  it.each([
    ['/categoria/notebooks', 'Notebooks'],
    ['/categoria/informatica/notebooks', 'Notebooks'],
    ['/buscar?q=lenovo', 'Resultados para “lenovo”'],
    ['/producto/algo', 'Página no encontrada'],
    ['/carrito', 'Carrito de compras'],
    ['/checkout', 'Checkout'],
    ['/pedido/123', 'Pedido no encontrado'],
  ])('%s resuelve a su pantalla', async (path, heading) => {
    renderAt(path)
    // Las pantallas se cargan bajo demanda: primero se ve el esqueleto.
    expect(
      await screen.findByRole('heading', { level: 1, name: heading }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('cada ruta define su meta description y las privadas son noindex', async () => {
    const meta = () =>
      document.head.querySelector('meta[name="description"]')?.getAttribute('content')
    const robots = () => document.head.querySelector('meta[name="robots"]')
    const view = renderAt('/producto/notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd')
    await screen.findByRole('heading', { level: 1, name: /IdeaPad 3/ }, { timeout: 8000 })
    expect(meta()).toMatch(/Lenovo/)
    expect(robots()).toBeNull()
    view.unmount()

    renderAt('/carrito')
    await screen.findByRole('heading', { level: 1, name: 'Carrito de compras' }, { timeout: 8000 })
    expect(robots()).toHaveAttribute('content', expect.stringContaining('noindex'))
  })

  it('rutas desconocidas muestran 404 con salidas útiles', () => {
    renderAt('/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Ver productos' })).toHaveAttribute('href', '/buscar')
  })

  it('/admin sin sesión lleva al acceso de la demo, con el aviso de modo demo', async () => {
    renderAt('/admin')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Panel administrador' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar como demo' })).toBeInTheDocument()
    expect(screen.getByText(/Modo demo/)).toBeInTheDocument()
  })
})
