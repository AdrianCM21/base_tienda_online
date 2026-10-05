import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CategoryMenu } from './CategoryMenu'

describe('CategoryMenu', () => {
  it('abre el panel con las categorías y se cierra con Esc', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryMenu />)
    const button = screen.getByRole('button', { name: 'Categorías' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Todas las categorías' })).toBeNull()

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Computación' })).toHaveAttribute(
      'href',
      '/categoria/informatica',
    )
    expect(screen.getByRole('link', { name: 'Notebooks' })).toHaveAttribute(
      'href',
      '/categoria/notebooks',
    )

    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })
})
