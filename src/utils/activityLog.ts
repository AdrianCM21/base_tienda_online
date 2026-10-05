import { readStorage, writeStorage } from './storage'

export type ActivityKind =
  'pedido' | 'producto' | 'marketing' | 'sesion' | 'exportacion' | 'configuracion'

export type ActivityEntry = {
  id: string
  /** ISO 8601 */
  at: string
  user: string
  kind: ActivityKind
  message: string
  /** Enlace al elemento afectado (opcional). */
  to?: string
  /** true si la hizo quien está usando esta demo (las demás son de ejemplo). */
  mine?: boolean
}

export const ACTIVITY_KEY = 'tienda-demo:admin-activity'
export const ACTIVITY_EVENT = 'tienda-demo:activity'
export const MAX_ENTRIES = 200
export const CURRENT_USER = 'Administrador demo'

export const ACTIVITY_LABEL: Record<ActivityKind, string> = {
  pedido: 'Pedidos',
  producto: 'Productos',
  marketing: 'Marketing',
  sesion: 'Sesión',
  exportacion: 'Exportaciones',
  configuracion: 'Configuración',
}

export function readActivity(): ActivityEntry[] {
  const raw = readStorage<unknown>(ACTIVITY_KEY, [])
  return Array.isArray(raw)
    ? (raw as ActivityEntry[]).filter(
        (e) => e && typeof e.id === 'string' && typeof e.at === 'string',
      )
    : []
}

/** Registra una acción hecha en el panel (queda en este navegador; "Reiniciar demo" la borra). */
export function appendActivity(
  entry: { kind: ActivityKind; message: string; to?: string },
  now: Date = new Date(),
): ActivityEntry {
  const full: ActivityEntry = {
    id: `mine-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    at: now.toISOString(),
    user: CURRENT_USER,
    mine: true,
    ...entry,
  }
  writeStorage(ACTIVITY_KEY, [full, ...readActivity()].slice(0, MAX_ENTRIES))
  window.dispatchEvent(new Event(ACTIVITY_EVENT))
  return full
}

export function clearActivity(): void {
  writeStorage(ACTIVITY_KEY, [])
  window.dispatchEvent(new Event(ACTIVITY_EVENT))
}

const TEAM = ['Lucía Benítez', 'Carlos Ramírez', 'Natalia Cabrera', CURRENT_USER]
const SAMPLE: { kind: ActivityKind; message: string; to?: string }[] = [
  { kind: 'pedido', message: 'Marcó un pedido como enviado', to: '/admin/pedidos' },
  { kind: 'pedido', message: 'Confirmó el pago de un pedido', to: '/admin/pedidos' },
  {
    kind: 'producto',
    message: 'Actualizó el precio de «Smart TV 55" 4K UHD»',
    to: '/admin/productos/p025',
  },
  {
    kind: 'producto',
    message: 'Repuso stock de «Mochila Porta Notebook 15.6"»',
    to: '/admin/inventario',
  },
  {
    kind: 'producto',
    message: 'Importó productos desde Excel (12 nuevos, 30 actualizados)',
    to: '/admin/productos',
  },
  { kind: 'marketing', message: 'Creó el cupón BIENVENIDA10', to: '/admin/marketing/cupones' },
  { kind: 'marketing', message: 'Pausó el cupón PRUEBA5', to: '/admin/marketing/cupones' },
  {
    kind: 'marketing',
    message: 'Cambió el banner principal de la Home',
    to: '/admin/marketing/banners',
  },
  { kind: 'exportacion', message: 'Exportó el catálogo a Excel', to: '/admin/productos' },
  { kind: 'exportacion', message: 'Exportó los pedidos a CSV', to: '/admin/pedidos' },
  { kind: 'configuracion', message: 'Actualizó las tarifas de envío', to: '/admin/configuracion' },
  {
    kind: 'configuracion',
    message: 'Invitó a un nuevo usuario al panel',
    to: '/admin/configuracion',
  },
  { kind: 'sesion', message: 'Inició sesión' },
]

/** Historial de ejemplo, determinista, repartido en los últimos 14 días (para que la pantalla no empiece vacía). */
export function sampleActivity(now: Date, count = 26): ActivityEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const s = SAMPLE[(i * 7 + 3) % SAMPLE.length]
    const at = new Date(now.getTime() - (i * 13.5 + ((i * 37) % 11)) * 3_600_000)
    return { id: `ej-${i}`, at: at.toISOString(), user: TEAM[(i * 5 + 1) % TEAM.length], ...s }
  })
}

/** Registro completo: acciones propias primero según la fecha, mezcladas con el historial de ejemplo. */
export function mergeActivity(mine: ActivityEntry[], now: Date): ActivityEntry[] {
  return [...mine, ...sampleActivity(now)].sort((a, b) => b.at.localeCompare(a.at))
}
