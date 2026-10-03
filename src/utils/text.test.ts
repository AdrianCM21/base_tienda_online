import { normalizeText, slugify } from './text'

describe('text', () => {
  it('normaliza tildes y mayúsculas', () => {
    expect(normalizeText('  Cámara ÑANDÚ ')).toBe('camara nandu')
  })
  it('slugify', () => {
    expect(slugify('Notebook Lenovo IdeaPad 3 15" Ryzen 5')).toBe(
      'notebook-lenovo-ideapad-3-15-ryzen-5',
    )
    expect(slugify('Fotografía y Filmación')).toBe('fotografia-y-filmacion')
  })
})
