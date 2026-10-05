import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Drawer } from './Drawer'

/** El padre pasa una función nueva en cada render (caso real de OrdersPage). */
function Parent({ onClosed }: { onClosed: () => void }) {
  const [text, setText] = useState('')
  return (
    <Drawer open onClose={() => onClosed()} title="Panel">
      <textarea aria-label="nota" value={text} onChange={(e) => setText(e.target.value)} />
    </Drawer>
  )
}

describe('Drawer', () => {
  it('no le roba el foco al campo cuando el padre se vuelve a renderizar', async () => {
    const user = userEvent.setup()
    render(<Parent onClosed={() => {}} />)
    await user.type(screen.getByLabelText('nota'), 'texto largo sin perder el foco')
    expect(screen.getByLabelText('nota')).toHaveValue('texto largo sin perder el foco')
  })

  it('Escape llama a la versión más reciente de onClose', async () => {
    const user = userEvent.setup()
    const onClosed = vi.fn()
    render(<Parent onClosed={onClosed} />)
    await user.keyboard('{Escape}')
    expect(onClosed).toHaveBeenCalledTimes(1)
  })
})
