import { contrastRatio } from './color'

describe('contrastRatio', () => {
  it('negro sobre blanco es 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })
  it('es simétrico', () => {
    expect(contrastRatio('#1D5FC1', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#1D5FC1'))
  })
})
