import { createContext } from 'react'

export type ToastOptions = {
  /** Botón dentro del aviso (p. ej. "Deshacer"). Al pulsarlo el aviso se cierra. */
  action?: { label: string; onClick: () => void }
}

export type ToastContextValue = {
  /** Muestra un aviso breve (se cierra solo; con acción dura más para dar tiempo a usarla). */
  toast: (message: string, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
