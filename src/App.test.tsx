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
    ['/admin', 'Panel administrador'],
  ])('%s resuelve a su pantalla', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('rutas desconocidas muestran 404', () => {
    renderAt('/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('el admin muestra el aviso de modo demo', () => {
    renderAt('/admin')
    expect(screen.getByText(/Modo demo/)).toBeInTheDocument()
  })
})
