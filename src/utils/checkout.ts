import { brand } from '@/config/brand'
import type { CardData, ShippingData, ShippingMethod } from '@/types/checkout'
import { installmentAmount } from './format'
import { isValidCvv, isValidExpiry, isValidPhone, passesLuhn } from './validators'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export const emptyShipping: ShippingData = {
  fullName: '',
  phone: '',
  method: 'domicilio',
  address: '',
  city: '',
  department: '',
  postalCode: '',
  branchId: '',
}

export const emptyCard: CardData = { number: '', name: '', expiry: '', cvv: '' }

export function validateShipping(d: ShippingData): FieldErrors<ShippingData> {
  const e: FieldErrors<ShippingData> = {}
  if (d.fullName.trim().split(/\s+/).length < 2) e.fullName = 'Ingresá nombre y apellido'
  if (!isValidPhone(d.phone)) e.phone = 'Ingresá un teléfono válido, por ejemplo 0981 234 567'
  if (d.method === 'retiro') {
    if (!d.branchId) e.branchId = 'Elegí la sucursal de retiro'
  } else {
    if (d.address.trim().length < 5) e.address = 'Ingresá la dirección completa'
    if (!d.city.trim()) e.city = 'Ingresá la ciudad'
    if (!d.department) e.department = 'Elegí el departamento'
    if (!/^\d{4}$/.test(d.postalCode.trim())) e.postalCode = 'El código postal tiene 4 dígitos'
  }
  return e
}

export function validateCard(c: CardData, now: Date = new Date()): FieldErrors<CardData> {
  const e: FieldErrors<CardData> = {}
  if (!passesLuhn(c.number.replace(/\s/g, ''))) e.number = 'Número de tarjeta inválido'
  if (c.name.trim().length < 3) e.name = 'Ingresá el nombre como figura en la tarjeta'
  if (!isValidExpiry(c.expiry, now)) e.expiry = 'Vencimiento inválido (MM/AA)'
  if (!isValidCvv(c.cvv)) e.cvv = 'CVV de 3 o 4 dígitos'
  return e
}

/** Envío a domicilio: gratis desde el umbral, si no tarifa fija. Retiro en sucursal: gratis. */
export function shippingCost(subtotal: number, method: ShippingMethod): number {
  if (method === 'retiro' || subtotal <= 0) return 0
  return subtotal >= brand.freeShippingThreshold ? 0 : brand.shippingFee
}

const INSTALLMENT_STEPS = [18, 12, 6, 3, 1]

/** Opciones de cuotas ofrecidas: las estándar hasta el máximo que admiten todos los productos. */
export function installmentOptions(
  total: number,
  maxCount: number,
): { count: number; amount: number }[] {
  const counts = INSTALLMENT_STEPS.filter((n) => n <= Math.max(1, maxCount))
  return counts.map((count) => ({
    count,
    amount: count === 1 ? total : installmentAmount(total, count),
  }))
}
