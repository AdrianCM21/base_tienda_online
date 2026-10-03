import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('marca la página actual, deshabilita ‹ en la primera y llama onPageChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={1} pageCount={5} onPageChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: 'Página 3' }))
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    expect(onChange).toHaveBeenNthCalledWith(1, 3)
    expect(onChange).toHaveBeenNthCalledWith(2, 2)
  })
  it('no se muestra con una sola página', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
