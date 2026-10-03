import { createContext } from 'react'

export type ToastContextValue = {
  /** Muestra un aviso breve (se cierra solo). */
  toast: (message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
