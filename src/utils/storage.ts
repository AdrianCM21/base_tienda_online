/** localStorage tolerante a fallos (modo privado, cuota, datos corruptos). */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sin almacenamiento disponible: la app sigue funcionando sin persistir */
  }
}

/** sessionStorage tolerante a fallos (dura mientras la pestaña esté abierta). */
export function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) window.sessionStorage.removeItem(key)
    else window.sessionStorage.setItem(key, value)
  } catch {
    /* sin almacenamiento disponible */
  }
}

/** Borra de localStorage todas las claves que empiezan con `prefix`, salvo las de `keep`. */
export function clearStorageByPrefix(prefix: string, keep: string[] = []): void {
  try {
    const keys = Object.keys(window.localStorage).filter(
      (k) => k.startsWith(prefix) && !keep.includes(k),
    )
    for (const k of keys) window.localStorage.removeItem(k)
  } catch {
    /* sin almacenamiento disponible */
  }
}
