import { brand } from '@/config/brand'
import {
  emptyCard,
  emptyShipping,
  installmentOptions,
  shippingCost,
  validateCard,
  validateShipping,
} from './checkout'

const ok = {
  ...emptyShipping,
  fullName: 'María Fernández',
  phone: '0981 234 567',
  address: 'Mcal. López 1234',
  city: 'Asunción',
  department: 'Central',
  postalCode: '1209',
}

describe('validateShipping', () => {
  it('acepta datos completos', () => expect(validateShipping(ok)).toEqual({}))
  it('reporta cada campo faltante del envío a domicilio', () => {
    expect(Object.keys(validateShipping(emptyShipping)).sort()).toEqual([
      'address',
      'city',
      'department',
      'fullName',
      'phone',
      'postalCode',
    ])
  })
  it('exige nombre y apellido y código postal de 4 dígitos', () => {
    expect(validateShipping({ ...ok, fullName: 'María' }).fullName).toBeDefined()
    expect(validateShipping({ ...ok, postalCode: '12' }).postalCode).toBeDefined()
  })
  it('retiro en sucursal: pide sucursal y no dirección', () => {
    const e = validateShipping({
      ...emptyShipping,
      method: 'retiro',
      fullName: 'Ana Pérez',
      phone: '0981234567',
    })
    expect(Object.keys(e)).toEqual(['branchId'])
    expect(
      validateShipping({
        ...emptyShipping,
        method: 'retiro',
        fullName: 'Ana Pérez',
        phone: '0981234567',
        branchId: 'san-lorenzo',
      }),
    ).toEqual({})
  })
})

describe('validateCard', () => {
  const now = new Date(2026, 9, 3)
  const card = {
    number: '4242 4242 4242 4242',
    name: 'MARIA FERNANDEZ',
    expiry: '12/28',
    cvv: '123',
  }
  it('acepta una tarjeta de prueba válida', () => expect(validateCard(card, now)).toEqual({}))
  it('rechaza Luhn inválido, vencida y CVV corto', () => {
    expect(validateCard({ ...card, number: '4242 4242 4242 4241' }, now).number).toBeDefined()
    expect(validateCard({ ...card, expiry: '09/26' }, now).expiry).toBeDefined()
    expect(validateCard({ ...card, expiry: '10/26' }, now).expiry).toBeUndefined()
    expect(validateCard({ ...card, cvv: '12' }, now).cvv).toBeDefined()
  })
  it('todo vacío da 4 errores', () =>
    expect(Object.keys(validateCard(emptyCard, now))).toHaveLength(4))
})

describe('shippingCost', () => {
  it('gratis desde el umbral, tarifa debajo, y gratis en retiro', () => {
    expect(shippingCost(brand.freeShippingThreshold, 'domicilio')).toBe(0)
    expect(shippingCost(brand.freeShippingThreshold - 1, 'domicilio')).toBe(brand.shippingFee)
    expect(shippingCost(100, 'retiro')).toBe(0)
    expect(shippingCost(0, 'domicilio')).toBe(0)
  })
})

describe('installmentOptions', () => {
  it('limita por el máximo admitido', () => {
    expect(installmentOptions(4839000, 12).map((o) => o.count)).toEqual([12, 6, 3, 1])
    expect(installmentOptions(4839000, 3).map((o) => o.count)).toEqual([3, 1])
    expect(installmentOptions(4839000, 0).map((o) => o.count)).toEqual([1])
  })
  it('montos como en el mockup', () => {
    expect(installmentOptions(4839000, 12)[0].amount).toBe(403200)
    expect(installmentOptions(4590000, 12).find((o) => o.count === 1)!.amount).toBe(4590000)
  })
})
