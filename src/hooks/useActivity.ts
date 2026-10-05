import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import {
  ACTIVITY_EVENT,
  ACTIVITY_KEY,
  appendActivity,
  mergeActivity,
  readActivity,
  type ActivityEntry,
  type ActivityKind,
} from '@/utils/activityLog'

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => e.key === ACTIVITY_KEY && callback()
  window.addEventListener(ACTIVITY_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(ACTIVITY_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}
// El texto crudo es un valor estable para useSyncExternalStore (el arreglo parseado no lo sería).
const snapshot = () => window.localStorage.getItem(ACTIVITY_KEY) ?? ''

/** Registro de actividad del panel: `entries` (propias + ejemplo) y `log` para anotar una acción. */
export function useActivity() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '')
  const [now] = useState(() => new Date())
  // `raw` no se lee: solo avisa que el registro cambió y hay que volver a leerlo.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const entries: ActivityEntry[] = useMemo(() => mergeActivity(readActivity(), now), [raw, now])
  const log = useCallback(
    (kind: ActivityKind, message: string, to?: string) =>
      void appendActivity({ kind, message, to }),
    [],
  )
  return { entries, log }
}
