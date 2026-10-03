export type ShippingMethod = 'domicilio' | 'retiro'

export type ShippingData = {
  fullName: string
  phone: string
  method: ShippingMethod
  address: string
  city: string
  department: string
  postalCode: string
  /** Sucursal de retiro (solo si method = "retiro"). */
  branchId: string
}

export type PaymentMethod = 'tarjeta' | 'transferencia' | 'efectivo'

export type CardData = {
  number: string
  name: string
  expiry: string
  cvv: string
}

export type Branch = { id: string; name: string; address: string; hours: string }
