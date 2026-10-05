import type { ReactNode } from 'react'
import { CartProvider } from './CartContext'
import { CurrencyProvider } from './CurrencyContext'
import { DemoBarProvider } from './DemoBarContext'
import { ThemeProvider } from './ThemeContext'
import { ToastProvider } from './ToastContext'

/** Todos los providers globales de la app (también usado en los tests). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <DemoBarProvider>
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </DemoBarProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
}
