export type CouponKind = 'percent' | 'fixed' | 'free-shipping'

export type Coupon = {
  id: string
  code: string
  kind: CouponKind
  /** % (percent), monto en Gs (fixed) o 0 (free-shipping). */
  value: number
  minPurchase: number
  /** Cantidad máxima de usos; `null` = ilimitado. */
  usageLimit: number | null
  used: number
  /** AAAA-MM-DD */
  startsAt: string
  endsAt: string
  active: boolean
  /** "todos" o el id de una categoría. */
  appliesTo: string
}

export type CouponStatus = 'activo' | 'programado' | 'vencido' | 'agotado' | 'pausado'
