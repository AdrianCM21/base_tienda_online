import { render, screen } from '@testing-library/react'
import { PageSkeleton } from './Skeleton'

describe('PageSkeleton', () => {
  it('se anuncia como carga en curso y no expone los bloques decorativos', () => {
    render(<PageSkeleton />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent('Cargando…')
    expect(status.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(8)
  })
})
