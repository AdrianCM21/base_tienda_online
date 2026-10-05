import { readStorage, writeStorage } from './storage'

const EVENT = 'tienda-demo:pref'

/** Preferencia en localStorage que avisa a todos los componentes del mismo documento cuando cambia. */
export function createPref<T>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  const read = (): T => {
    const v = readStorage<unknown>(key, fallback)
    return isValid(v) ? v : fallback
  }
  return {
    key,
    read,
    write(value: T) {
      writeStorage(key, value)
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
    },
    subscribe(callback: () => void) {
      const onPref = (e: Event) => (e as CustomEvent).detail === key && callback()
      const onStorage = (e: StorageEvent) => e.key === key && callback()
      window.addEventListener(EVENT, onPref)
      window.addEventListener('storage', onStorage)
      return () => {
        window.removeEventListener(EVENT, onPref)
        window.removeEventListener('storage', onStorage)
      }
    },
  }
}
