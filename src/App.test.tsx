import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { brand } from './config/brand'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

describe('rutas', () => {
  it('muestra el nombre de la marca desde brand.ts', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: brand.logoText })).toBeInTheDocument()
    expect(document.title).toBe(brand.name)
  })

  it.each([
    ['/categoria/notebooks', 'Categoría'],
    ['/categoria/informatica/notebooks', 'Categoría'],
    ['/buscar?q=lenovo', 'Búsqueda'],
    ['/producto/algo', 'Producto'],
    ['/carrito', 'Carrito'],
    ['/checkout', 'Checkout'],
    ['/pedido/123', 'Pedido confirmado'],
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
    expect(screen.getByRole('status')).toHaveTextContent('Modo demo')
  })
})
