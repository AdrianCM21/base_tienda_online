import { ivaIncluded, withIva } from './tax'

describe('IVA', () => {
  it('extrae el IVA contenido en un precio con IVA', () => {
    expect(ivaIncluded(110_000, 10)).toBe(10_000)
    expect(ivaIncluded(105_000, 5)).toBe(5_000)
    expect(ivaIncluded(110_000, 0)).toBe(0)
  })
  it('suma el IVA a un neto', () => {
    expect(withIva(100_000, 10)).toBe(110_000)
    expect(withIva(100_000, 0)).toBe(100_000)
  })
})
