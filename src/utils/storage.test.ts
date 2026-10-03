import { readStorage, writeStorage } from './storage'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('devuelve el fallback si no hay valor', () => {
    expect(readStorage('x', 5)).toBe(5)
  })

  it('guarda y lee JSON', () => {
    writeStorage('x', { a: 1 })
    expect(readStorage('x', null)).toEqual({ a: 1 })
  })

  it('devuelve el fallback si el JSON está corrupto', () => {
    window.localStorage.setItem('x', '{roto')
    expect(readStorage('x', 'fb')).toBe('fb')
  })

  it('no lanza si localStorage falla al escribir', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota')
    })
    expect(() => writeStorage('x', 1)).not.toThrow()
  })
})
