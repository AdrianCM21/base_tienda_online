import { readStorage, writeStorage } from './storage'

export const VISITED_KEY = 'tienda-demo:admin-visited'
export const CHECKLIST_HIDDEN_KEY = 'tienda-demo:admin-checklist-hidden'

export type VisitKey = 'apariencia' | 'configuracion' | 'cupones' | 'banners'

export function getVisited(): VisitKey[] {
  const raw = readStorage<unknown>(VISITED_KEY, [])
  return Array.isArray(raw) ? (raw.filter((k) => typeof k === 'string') as VisitKey[]) : []
}

/** Recuerda que se pasó por una pantalla (alimenta el checklist de inicio). */
export function markVisited(key: VisitKey): void {
  const current = getVisited()
  if (!current.includes(key)) writeStorage(VISITED_KEY, [...current, key])
}
