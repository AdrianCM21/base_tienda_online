import { createContext } from 'react'
import type { Theme, ThemeId } from '@/config/themes'

export type ThemeContextValue = {
  theme: Theme
  setTheme: (id: ThemeId) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
