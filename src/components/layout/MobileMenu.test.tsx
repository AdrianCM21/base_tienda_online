import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@/test/renderWithProviders'
import { Header } from './Header'

const ui = (
  <>
    <Header />
    <Routes>
      <Route path="*" element={<Link to="/">ir</Link>} />
    </Routes>
  </>
)

describe('Menú móvil', () => {
  it('el botón junto al logo abre las categorías y Escape las cierra', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui)
    const toggle = screen.getByRole('button', { name: 'Abrir menú de categorías' })
    await user.click(toggle)
    const dialog = screen.getByRole('dialog', { name: 'Categorías' })
    expect(within(dialog).getByRole('link', { name: 'Notebooks' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })

  it('al elegir una subcategoría navega y se cierra', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui)
    await user.click(screen.getByRole('button', { name: 'Abrir menú de categorías' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Monitores' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
