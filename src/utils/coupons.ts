import type { Coupon, CouponKind, CouponStatus } from '@/types/coupon'

export const COUPON_KINDS: { value: CouponKind; label: string }[] = [
  { value: 'percent', label: 'Porcentaje de descuento' },
  { value: 'fixed', label: 'Monto fijo de descuento' },
  { value: 'free-shipping', label: 'Envío gratis' },
]

/** Estado según pausa, usos y fechas (`today` en AAAA-MM-DD). Una pausa manda sobre todo lo demás. */
export function couponStatus(c: Coupon, today: string): CouponStatus {
  if (!c.active) return 'pausado'
  if (c.usageLimit !== null && c.used >= c.usageLimit) return 'agotado'
  if (c.endsAt < today) return 'vencido'
  if (c.startsAt > today) return 'programado'
  return 'activo'
}

/** Texto de lo que el cliente ve: "10% de descuento · en compras desde Gs. 300.000 · solo en Moda". */
export function describeCoupon(
  c: Pick<Coupon, 'kind' | 'value' | 'minPurchase' | 'appliesTo'>,
  money: (n: number) => string,
  categoryName?: (id: string) => string | undefined,
): string {
  const what =
    c.kind === 'percent'
      ? `${c.value}% de descuento`
      : c.kind === 'fixed'
        ? `${money(c.value)} de descuento`
        : 'Envío gratis'
  const parts = [what]
  if (c.minPurchase > 0) parts.push(`en compras desde ${money(c.minPurchase)}`)
  if (c.appliesTo !== 'todos') parts.push(`solo en ${categoryName?.(c.appliesTo) ?? c.appliesTo}`)
  return parts.join(' · ')
}

export type CouponDraft = {
  code: string
  kind: CouponKind
  value: string
  minPurchase: string
  usageLimit: string
  startsAt: string
  endsAt: string
  appliesTo: string
}
export type CouponErrors = Partial<Record<keyof CouponDraft, string>>

export const blankCouponDraft = (today: string): CouponDraft => ({
  code: '',
  kind: 'percent',
  value: '10',
  minPurchase: '',
  usageLimit: '',
  startsAt: today,
  endsAt: '',
  appliesTo: 'todos',
})

export function validateCouponDraft(d: CouponDraft, existingCodes: string[]): CouponErrors {
  const e: CouponErrors = {}
  const code = d.code.trim().toUpperCase()
  if (!/^[A-Z0-9]{4,20}$/.test(code)) e.code = 'Usá entre 4 y 20 letras o números, sin espacios'
  else if (existingCodes.map((c) => c.toUpperCase()).includes(code))
    e.code = 'Ya existe un cupón con ese código'
  const value = Number(d.value)
  if (d.kind === 'percent' && !(Number.isInteger(value) && value >= 1 && value <= 100))
    e.value = 'El porcentaje debe estar entre 1 y 100'
  if (d.kind === 'fixed' && !(Number.isInteger(value) && value > 0))
    e.value = 'Ingresá un monto mayor a 0'
  if (d.usageLimit && !(Number.isInteger(Number(d.usageLimit)) && Number(d.usageLimit) > 0))
    e.usageLimit = 'Dejalo vacío (ilimitado) o ingresá un número mayor a 0'
  if (!d.startsAt) e.startsAt = 'Elegí la fecha de inicio'
  if (!d.endsAt) e.endsAt = 'Elegí la fecha de fin'
  else if (d.startsAt && d.endsAt < d.startsAt)
    e.endsAt = 'La fecha de fin no puede ser anterior al inicio'
  return e
}

export function draftToCoupon(d: CouponDraft, id: string): Coupon {
  return {
    id,
    code: d.code.trim().toUpperCase(),
    kind: d.kind,
    value: d.kind === 'free-shipping' ? 0 : Number(d.value),
    minPurchase: Number(d.minPurchase) || 0,
    usageLimit: d.usageLimit ? Number(d.usageLimit) : null,
    used: 0,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    active: true,
    appliesTo: d.appliesTo,
  }
}
