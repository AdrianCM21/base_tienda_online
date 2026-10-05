import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_BAR_HEIGHT, isDemoBarEnabled } from '@/config/demoScreens'
import { DEMO_BAR_STORAGE_KEY } from '@/services/demoService'
import { readSession, readStorage, writeSession, writeStorage } from '@/utils/storage'
import { DemoBarContext } from './demo-bar-context'

const SESSION_KEY = 'tienda-demo:demo-bar-off'

/**
 * Visibilidad inicial:
 * - `?demo=0` oculta solo durante la pestaña actual (sessionStorage), para presentaciones limpias.
 * - `?demo=1` la vuelve a mostrar y borra la preferencia guardada.
 * - Si no, se respeta lo que el usuario eligió con ✕ / "Demo".
 */
function initialHidden(): boolean {
  const demo = new URLSearchParams(window.location.search).get('demo')
  if (demo === '1') {
    writeSession(SESSION_KEY, null)
    writeStorage(DEMO_BAR_STORAGE_KEY, false)
    return false
  }
  if (demo === '0') {
    writeSession(SESSION_KEY, '1')
    return true
  }
  return (
    readSession(SESSION_KEY) === '1' || readStorage<boolean>(DEMO_BAR_STORAGE_KEY, false) === true
  )
}

export function DemoBarProvider({ children }: { children: ReactNode }) {
  const enabled = isDemoBarEnabled()
  const [hidden, setHidden] = useState(initialHidden)
  const visible = enabled && !hidden

  // Los elementos sticky de la tienda se corren esta altura para no quedar bajo la barra.
  useEffect(() => {
    document.documentElement.style.setProperty('--demo-bar-h', `${visible ? DEMO_BAR_HEIGHT : 0}px`)
  }, [visible])

  const hide = useCallback(() => {
    setHidden(true)
    writeStorage(DEMO_BAR_STORAGE_KEY, true)
  }, [])
  const show = useCallback(() => {
    setHidden(false)
    writeStorage(DEMO_BAR_STORAGE_KEY, false)
    writeSession(SESSION_KEY, null)
  }, [])

  const value = useMemo(() => ({ enabled, visible, hide, show }), [enabled, visible, hide, show])
  return <DemoBarContext.Provider value={value}>{children}</DemoBarContext.Provider>
}
