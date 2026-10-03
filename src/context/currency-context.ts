import { createContext } from 'react'
import type { Currency } from '@/types/currency'

export type CurrencyContextValue = {
  currency: Currency
  setCurrency: (c: Currency) => void
  /** Formatea un monto en Gs en la moneda activa. */
  price: (gs: number) => string
  /** "12 cuotas de …" en la moneda activa (null si es pago único). */
  installments: (gs: number, count: number) => string | null
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null)
