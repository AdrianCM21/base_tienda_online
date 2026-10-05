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

import { clearStorageByPrefix, readSession, writeSession } from './storage'

describe('storage: sesión y limpieza por prefijo', () => {
  it('sessionStorage lee, escribe y borra', () => {
    expect(readSession('s')).toBeNull()
    writeSession('s', '1')
    expect(readSession('s')).toBe('1')
    writeSession('s', null)
    expect(readSession('s')).toBeNull()
  })
  it('clearStorageByPrefix borra solo el prefijo y respeta las excepciones', () => {
    window.localStorage.setItem('app:a', '1')
    window.localStorage.setItem('app:b', '2')
    window.localStorage.setItem('otra', '3')
    clearStorageByPrefix('app:', ['app:b'])
    expect(window.localStorage.getItem('app:a')).toBeNull()
    expect(window.localStorage.getItem('app:b')).toBe('2')
    expect(window.localStorage.getItem('otra')).toBe('3')
  })
})
