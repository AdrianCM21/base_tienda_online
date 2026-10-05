import { useCallback, useSyncExternalStore } from 'react'
import { createPref } from '@/utils/localPref'

export type AdminMode = 'light' | 'dark'

export const adminModePref = createPref<AdminMode>(
  'tienda-demo:admin-mode',
  'light',
  (v): v is AdminMode => v === 'light' || v === 'dark',
)

/** Modo claro u oscuro del panel (se recuerda en este navegador; la tienda no cambia). */
export function useAdminMode() {
  const mode = useSyncExternalStore(
    adminModePref.subscribe,
    adminModePref.read,
    () => 'light' as AdminMode,
  )
  const toggle = useCallback(
    () => adminModePref.write(adminModePref.read() === 'dark' ? 'light' : 'dark'),
    [],
  )
  return { mode, toggle }
}
