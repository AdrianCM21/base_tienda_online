import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Currency } from '@/types/currency'
import { formatInstallments, formatPrice } from '@/utils/format'
import { readStorage, writeStorage } from '@/utils/storage'
import { CurrencyContext } from './currency-context'

export const CURRENCY_STORAGE_KEY = 'tienda-demo:currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() =>
    readStorage<string>(CURRENCY_STORAGE_KEY, 'Gs') === 'USD' ? 'USD' : 'Gs',
  )

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    writeStorage(CURRENCY_STORAGE_KEY, c)
  }, [])

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      price: (gs: number) => formatPrice(gs, currency),
      installments: (gs: number, count: number) => formatInstallments(gs, count, currency),
    }),
    [currency, setCurrency],
  )
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
