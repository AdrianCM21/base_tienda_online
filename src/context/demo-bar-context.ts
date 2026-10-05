import { createContext } from 'react'

export type DemoBarContextValue = {
  /** false si el build la desactivó (`VITE_DEMO_BAR=false`). */
  enabled: boolean
  visible: boolean
  hide: () => void
  show: () => void
}

export const DemoBarContext = createContext<DemoBarContextValue | null>(null)
