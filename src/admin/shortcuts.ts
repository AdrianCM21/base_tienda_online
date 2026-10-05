import { adminPaths, paths } from '@/config/routes'

export type GoShortcut = { key: string; label: string; to: string }

/** Atajos tipo "g" + letra para ir a cada sección. */
export const GO_SHORTCUTS: GoShortcut[] = [
  { key: 'i', label: 'Inicio', to: paths.admin },
  { key: 'p', label: 'Pedidos', to: adminPaths.orders },
  { key: 'c', label: 'Clientes', to: adminPaths.customers },
  { key: 'o', label: 'Productos', to: adminPaths.products },
  { key: 'n', label: 'Inventario', to: adminPaths.inventory },
  { key: 'm', label: 'Cupones', to: adminPaths.coupons },
  { key: 'r', label: 'Reportes', to: adminPaths.reports },
  { key: 'a', label: 'Actividad', to: adminPaths.activity },
  { key: 's', label: 'Configuración', to: adminPaths.settings },
]

export type ShortcutResult =
  { type: 'go'; to: string } | { type: 'pending' } | { type: 'search' } | { type: 'help' } | null

/** Interpreta una tecla según el prefijo pendiente ("g"). Función pura para poder probarla. */
export function resolveShortcut(pending: string | null, key: string): ShortcutResult {
  const k = key.length === 1 ? key.toLowerCase() : key
  if (pending === 'g') {
    const hit = GO_SHORTCUTS.find((s) => s.key === k)
    return hit ? { type: 'go', to: hit.to } : null
  }
  if (k === 'g') return { type: 'pending' }
  if (k === '/') return { type: 'search' }
  if (k === '?') return { type: 'help' }
  return null
}

/** ¿El foco está en un campo donde se escribe? Ahí los atajos de una tecla no deben activarse. */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}
