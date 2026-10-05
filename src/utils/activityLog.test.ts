import {
  ACTIVITY_EVENT,
  appendActivity,
  clearActivity,
  MAX_ENTRIES,
  mergeActivity,
  readActivity,
  sampleActivity,
  ACTIVITY_KEY,
} from './activityLog'

const NOW = new Date('2026-10-05T12:00:00Z')

describe('registro de actividad', () => {
  it('guarda las acciones propias (la más reciente primero) y avisa del cambio', () => {
    const seen = vi.fn()
    window.addEventListener(ACTIVITY_EVENT, seen)
    appendActivity({ kind: 'pedido', message: 'Uno' }, new Date('2026-10-05T10:00:00Z'))
    appendActivity(
      { kind: 'producto', message: 'Dos', to: '/admin/productos' },
      new Date('2026-10-05T11:00:00Z'),
    )
    window.removeEventListener(ACTIVITY_EVENT, seen)
    const log = readActivity()
    expect(log.map((e) => e.message)).toEqual(['Dos', 'Uno'])
    expect(log[0]).toMatchObject({
      mine: true,
      user: 'Administrador demo',
      kind: 'producto',
      to: '/admin/productos',
    })
    expect(seen).toHaveBeenCalledTimes(2)
  })
  it('limita el historial y se puede vaciar', () => {
    for (let i = 0; i < MAX_ENTRIES + 5; i++) appendActivity({ kind: 'sesion', message: String(i) })
    expect(readActivity()).toHaveLength(MAX_ENTRIES)
    clearActivity()
    expect(readActivity()).toEqual([])
  })
  it('tolera datos corruptos', () => {
    window.localStorage.setItem(ACTIVITY_KEY, '"basura"')
    expect(readActivity()).toEqual([])
    window.localStorage.setItem(
      ACTIVITY_KEY,
      JSON.stringify([{ nada: 1 }, { id: 'x', at: '2026-01-01T00:00:00Z', message: 'ok' }]),
    )
    expect(readActivity()).toHaveLength(1)
  })
  it('el historial de ejemplo es determinista, ordenado y no futuro', () => {
    const a = sampleActivity(NOW)
    expect(sampleActivity(NOW)).toEqual(a)
    expect(a.length).toBeGreaterThan(20)
    expect(a.every((e) => new Date(e.at).getTime() <= NOW.getTime())).toBe(true)
    expect(new Set(a.map((e) => e.user)).size).toBeGreaterThan(2)
    expect(new Set(a.map((e) => e.kind)).size).toBeGreaterThan(4)
    expect(new Set(a.map((e) => e.id)).size).toBe(a.length)
  })
  it('mergeActivity mezcla lo propio con el ejemplo por fecha', () => {
    const mine = appendActivity(
      { kind: 'pedido', message: 'Reciente' },
      new Date('2026-10-05T12:01:00Z'),
    )
    const all = mergeActivity([mine], NOW)
    expect(all[0].message).toBe('Reciente')
    expect(all.map((e) => e.at)).toEqual([...all.map((e) => e.at)].sort().reverse())
  })
})
