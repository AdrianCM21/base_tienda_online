import { GO_SHORTCUTS, isTypingTarget, resolveShortcut } from './shortcuts'

describe('resolveShortcut', () => {
  it('"g" deja un prefijo pendiente y la letra siguiente navega', () => {
    expect(resolveShortcut(null, 'g')).toEqual({ type: 'pending' })
    expect(resolveShortcut('g', 'p')).toEqual({ type: 'go', to: '/admin/pedidos' })
    expect(resolveShortcut('g', 'G')).toBeNull() // "g g" no es un atajo
    expect(resolveShortcut('g', 'z')).toBeNull()
  })
  it('"/" busca y "?" abre la ayuda', () => {
    expect(resolveShortcut(null, '/')).toEqual({ type: 'search' })
    expect(resolveShortcut(null, '?')).toEqual({ type: 'help' })
  })
  it('sin prefijo, las letras de navegación no hacen nada', () => {
    expect(resolveShortcut(null, 'p')).toBeNull()
    expect(resolveShortcut(null, 'Enter')).toBeNull()
  })
  it('las teclas son únicas y todas llevan a una ruta del panel', () => {
    expect(new Set(GO_SHORTCUTS.map((s) => s.key)).size).toBe(GO_SHORTCUTS.length)
    expect(GO_SHORTCUTS.every((s) => s.to.startsWith('/admin'))).toBe(true)
    expect(GO_SHORTCUTS.every((s) => !['g', '/', '?'].includes(s.key))).toBe(true)
  })
})

describe('isTypingTarget', () => {
  it('detecta campos de texto, selects y contenteditable', () => {
    for (const tag of ['input', 'textarea', 'select'])
      expect(isTypingTarget(document.createElement(tag))).toBe(true)
    const div = document.createElement('div')
    expect(isTypingTarget(div)).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
    expect(isTypingTarget(document.createElement('button'))).toBe(false)
  })
})
