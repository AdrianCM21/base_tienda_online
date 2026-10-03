import {
  formatGs,
  formatInstallments,
  formatNumber,
  formatPrice,
  formatUsd,
  installmentAmount,
} from './format'

describe('format', () => {
  it('separa miles con punto', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(4590000)).toBe('4.590.000')
  })
  it('formatea Gs y USD como en los mockups', () => {
    expect(formatGs(4590000)).toBe('Gs. 4.590.000')
    expect(formatUsd(4590000 / 7300)).toBe('USD 628,77')
    expect(formatUsd(1234567.891)).toBe('USD 1.234.567,89')
  })
  it('formatPrice convierte según la moneda y la tasa', () => {
    expect(formatPrice(7300, 'USD', 7300)).toBe('USD 1,00')
    expect(formatPrice(7300, 'Gs')).toBe('Gs. 7.300')
  })
  it.each([
    [4590000, 12, 382500],
    [5190000, 12, 432500],
    [7890000, 18, 438300],
    [5990000, 18, 332700],
    [890000, 6, 148300],
  ])('cuota de %i en %i pagos = %i (valores del mockup)', (price, n, expected) => {
    expect(installmentAmount(price, n)).toBe(expected)
  })
  it('formatInstallments devuelve null para pago único', () => {
    expect(formatInstallments(100000, 1, 'Gs')).toBeNull()
    expect(formatInstallments(4590000, 12, 'Gs')).toBe('12 cuotas de Gs. 382.500')
  })
})
