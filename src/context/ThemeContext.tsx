import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { applyTheme, DEFAULT_THEME_ID, getTheme, type ThemeId } from '@/config/themes'
import { readStorage, writeStorage } from '@/utils/storage'
import { ThemeContext } from './theme-context'

export const THEME_STORAGE_KEY = 'tienda-demo:theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() =>
    readStorage(THEME_STORAGE_KEY, DEFAULT_THEME_ID),
  )
  const theme = getTheme(themeId)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    writeStorage(THEME_STORAGE_KEY, id)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
