import { useContext } from 'react'
import { CurrencyContext } from '@/context/currency-context'

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency debe usarse dentro de <CurrencyProvider>')
  return ctx
}
