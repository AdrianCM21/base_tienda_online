import { useCallback, useState } from 'react'
import { readStorage, writeStorage } from '@/utils/storage'

export const ADMIN_SESSION_KEY = 'tienda-demo:admin-session'

/** Sesión falsa del panel demo: solo recuerda que se pulsó "Entrar como demo". */
export function useAdminSession() {
  const [loggedIn, setLoggedIn] = useState(
    () => readStorage<boolean>(ADMIN_SESSION_KEY, false) === true,
  )
  const login = useCallback(() => {
    writeStorage(ADMIN_SESSION_KEY, true)
    setLoggedIn(true)
  }, [])
  const logout = useCallback(() => {
    writeStorage(ADMIN_SESSION_KEY, false)
    setLoggedIn(false)
  }, [])
  return { loggedIn, login, logout }
}
