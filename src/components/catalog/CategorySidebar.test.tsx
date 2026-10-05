import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CategorySidebar } from './CategorySidebar'

describe('CategorySidebar', () => {
  it('abre Computación por defecto y es un acordeón de una sola categoría', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategorySidebar />)
    expect(screen.getByRole('link', { name: 'Notebooks' })).toHaveAttribute(
      'href',
      '/categoria/notebooks',
    )
    expect(screen.getByRole('button', { name: /Computación/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('button', { name: /Celulares y Entretenimiento/ }))
    expect(screen.queryByRole('link', { name: 'Notebooks' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Smart TV' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Ver todo en Celulares y Entretenimiento/ }),
    ).toHaveAttribute('href', '/categoria/electronica')
  })
})
