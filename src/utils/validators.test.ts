import { isValidEmail } from './validators'

describe('isValidEmail', () => {
  it.each(['a@b.co', ' persona@dominio.com.py '])('acepta %s', (v) =>
    expect(isValidEmail(v)).toBe(true),
  )
  it.each(['', 'a', 'a@b', 'a b@c.com', '@x.com', 'a@.com'])('rechaza "%s"', (v) =>
    expect(isValidEmail(v)).toBe(false),
  )
})

import {
  formatCardNumber,
  formatExpiry,
  isValidCvv,
  isValidExpiry,
  isValidPhone,
  passesLuhn,
} from './validators'

describe('validadores de pago', () => {
  it('teléfono', () => {
    expect(isValidPhone('0981 234 567')).toBe(true)
    expect(isValidPhone('+595 981 234567')).toBe(true)
    expect(isValidPhone('12345')).toBe(false)
  })
  it('Luhn', () => {
    expect(passesLuhn('4242424242424242')).toBe(true)
    expect(passesLuhn('4242424242424241')).toBe(false)
    expect(passesLuhn('abcd')).toBe(false)
  })
  it('vencimiento', () => {
    const now = new Date(2026, 9, 3)
    expect(isValidExpiry('10/26', now)).toBe(true)
    expect(isValidExpiry('09/26', now)).toBe(false)
    expect(isValidExpiry('13/30', now)).toBe(false)
    expect(isValidExpiry('1/30', now)).toBe(false)
  })
  it('cvv y formatos', () => {
    expect(isValidCvv('123')).toBe(true)
    expect(isValidCvv('12a')).toBe(false)
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
    expect(formatCardNumber('42a42')).toBe('4242')
    expect(formatExpiry('1228')).toBe('12/28')
    expect(formatExpiry('1')).toBe('1')
  })
})
