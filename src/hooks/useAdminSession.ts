import { useCallback, useState } from 'react'
import { appendActivity } from '@/utils/activityLog'
import { readStorage, writeStorage } from '@/utils/storage'

export const ADMIN_SESSION_KEY = 'tienda-demo:admin-session'

/** Sesión falsa del panel demo: solo recuerda que se pulsó "Entrar como demo". */
export function useAdminSession() {
  const [loggedIn, setLoggedIn] = useState(
    () => readStorage<boolean>(ADMIN_SESSION_KEY, false) === true,
  )
  const login = useCallback(() => {
    writeStorage(ADMIN_SESSION_KEY, true)
    appendActivity({ kind: 'sesion', message: 'Inició sesión' })
    setLoggedIn(true)
  }, [])
  const logout = useCallback(() => {
    appendActivity({ kind: 'sesion', message: 'Cerró sesión' })
    writeStorage(ADMIN_SESSION_KEY, false)
    setLoggedIn(false)
  }, [])
  return { loggedIn, login, logout }
}
