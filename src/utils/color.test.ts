import { contrastRatio, describeContrast } from './color'

describe('contrastRatio', () => {
  it('negro sobre blanco es 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })
  it('es simétrico', () => {
    expect(contrastRatio('#1D5FC1', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#1D5FC1'))
  })
})

describe('describeContrast', () => {
  it('avisa cuando el texto blanco no se lee bien', () => {
    expect(describeContrast('#0C2851')).toMatchObject({ ok: true })
    expect(describeContrast('#FFE600')).toMatchObject({ ok: false })
    expect(describeContrast('#FFE600').text).toMatch(/Contraste bajo \(1\.\d:1\)/)
  })
})
