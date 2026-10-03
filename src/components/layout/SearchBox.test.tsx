import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/renderWithProviders'
import { SearchBox } from './SearchBox'

function Where() {
  const l = useLocation()
  return <p data-testid="where">{l.pathname + l.search}</p>
}

const ui = (
  <>
    <SearchBox />
    <Routes>
      <Route path="*" element={<Where />} />
    </Routes>
  </>
)

describe('SearchBox', () => {
  it('sugiere productos y navega al elegir con teclado', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui)
    await user.type(screen.getByRole('combobox'), 'lenovo')
    const options = await screen.findAllByRole('option')
    expect(options.length).toBeGreaterThan(0)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(screen.getByTestId('where').textContent).toMatch(/^\/producto\//)
  })

  it('Enter sin selección va a /buscar?q=', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui)
    await user.type(screen.getByRole('combobox'), 'tele{Enter}')
    expect(screen.getByTestId('where').textContent).toBe('/buscar?q=tele')
  })

  it('Escape cierra las sugerencias', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui)
    await user.type(screen.getByRole('combobox'), 'lenovo')
    await screen.findAllByRole('option')
    await user.keyboard('{Escape}')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
