import type { Coupon } from '@/types/coupon'
import coupons from '@/data/coupons.json'
import {
  blankCouponDraft,
  couponStatus,
  describeCoupon,
  draftToCoupon,
  validateCouponDraft,
} from './coupons'

const money = (n: number) => `Gs. ${n}`
const TODAY = '2026-10-05'
const base: Coupon = {
  id: 'x',
  code: 'X',
  kind: 'percent',
  value: 10,
  minPurchase: 0,
  usageLimit: null,
  used: 0,
  startsAt: '2026-09-01',
  endsAt: '2026-12-31',
  active: true,
  appliesTo: 'todos',
}

describe('couponStatus', () => {
  it('activo, programado, vencido, agotado y pausado (la pausa manda)', () => {
    expect(couponStatus(base, TODAY)).toBe('activo')
    expect(couponStatus({ ...base, startsAt: '2026-11-01' }, TODAY)).toBe('programado')
    expect(couponStatus({ ...base, endsAt: '2026-10-04' }, TODAY)).toBe('vencido')
    expect(couponStatus({ ...base, usageLimit: 10, used: 10 }, TODAY)).toBe('agotado')
    expect(couponStatus({ ...base, active: false, usageLimit: 10, used: 10 }, TODAY)).toBe(
      'pausado',
    )
  })
  it('los límites de fecha son inclusivos', () => {
    expect(couponStatus({ ...base, endsAt: TODAY }, TODAY)).toBe('activo')
    expect(couponStatus({ ...base, startsAt: TODAY }, TODAY)).toBe('activo')
  })
  it('los datos de ejemplo cubren todos los estados', () => {
    const states = new Set((coupons as Coupon[]).map((c) => couponStatus(c, TODAY)))
    for (const s of ['activo', 'programado', 'vencido', 'agotado', 'pausado'])
      expect(states.has(s as never), s).toBe(true)
  })
})

describe('describeCoupon', () => {
  it('describe tipo, mínimo y alcance', () => {
    expect(describeCoupon(base, money)).toBe('10% de descuento')
    expect(
      describeCoupon({ ...base, kind: 'fixed', value: 50000, minPurchase: 400000 }, money),
    ).toBe('Gs. 50000 de descuento · en compras desde Gs. 400000')
    expect(
      describeCoupon({ ...base, kind: 'free-shipping', appliesTo: 'moda' }, money, () => 'Moda'),
    ).toBe('Envío gratis · solo en Moda')
  })
})

describe('validateCouponDraft', () => {
  const ok = { ...blankCouponDraft(TODAY), code: 'verano24', endsAt: '2026-12-31' }
  it('acepta un borrador válido y lo convierte (código en mayúsculas)', () => {
    expect(validateCouponDraft(ok, [])).toEqual({})
    expect(draftToCoupon(ok, 'n1')).toMatchObject({
      code: 'VERANO24',
      kind: 'percent',
      value: 10,
      usageLimit: null,
      minPurchase: 0,
      used: 0,
      active: true,
    })
  })
  it('código inválido o repetido', () => {
    expect(validateCouponDraft({ ...ok, code: 'ab' }, []).code).toBeDefined()
    expect(validateCouponDraft({ ...ok, code: 'con espacio' }, []).code).toBeDefined()
    expect(validateCouponDraft(ok, ['VERANO24']).code).toMatch(/Ya existe/)
  })
  it('valor según el tipo', () => {
    expect(validateCouponDraft({ ...ok, value: '150' }, []).value).toBeDefined()
    expect(validateCouponDraft({ ...ok, kind: 'fixed', value: '0' }, []).value).toBeDefined()
    expect(
      validateCouponDraft({ ...ok, kind: 'free-shipping', value: '' }, []).value,
    ).toBeUndefined()
    expect(draftToCoupon({ ...ok, kind: 'free-shipping', value: '' }, 'n').value).toBe(0)
  })
  it('fechas y límite de usos', () => {
    expect(validateCouponDraft({ ...ok, endsAt: '' }, []).endsAt).toBeDefined()
    expect(validateCouponDraft({ ...ok, endsAt: '2026-01-01' }, []).endsAt).toMatch(/anterior/)
    expect(validateCouponDraft({ ...ok, usageLimit: '0' }, []).usageLimit).toBeDefined()
    expect(draftToCoupon({ ...ok, usageLimit: '50' }, 'n').usageLimit).toBe(50)
  })
})
