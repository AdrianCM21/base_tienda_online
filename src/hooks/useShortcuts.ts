import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { isTypingTarget, resolveShortcut } from '@/admin/shortcuts'
import { createPref } from '@/utils/localPref'

export const shortcutsPref = createPref<boolean>(
  'tienda-demo:admin-shortcuts',
  true,
  (v): v is boolean => typeof v === 'boolean',
)

/** ¿Están activos los atajos de una tecla? (WCAG 2.1.4: se pueden desactivar.) */
export function useShortcutsEnabled() {
  const enabled = useSyncExternalStore(shortcutsPref.subscribe, shortcutsPref.read, () => true)
  return { enabled, setEnabled: (v: boolean) => shortcutsPref.write(v) }
}

const PENDING_MS = 1200

/**
 * Atajos de teclado del panel: "g" + letra para navegar, "/" para buscar y "?" para la ayuda.
 * No actúan al escribir en un campo, con Ctrl/Alt/⌘ apretados ni con un diálogo abierto.
 */
export function useAdminShortcuts({
  enabled,
  onSearch,
  onHelp,
}: {
  enabled: boolean
  onSearch: () => void
  onHelp: () => void
}) {
  const navigate = useNavigate()
  const pending = useRef<{ key: string; timer: number } | null>(null)
  const handlers = useRef({ onSearch, onHelp })
  useEffect(() => {
    handlers.current = { onSearch, onHelp }
  })

  useEffect(() => {
    if (!enabled) return
    const clear = () => {
      if (pending.current) window.clearTimeout(pending.current.timer)
      pending.current = null
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return
      if (isTypingTarget(e.target) || document.querySelector('[aria-modal="true"]')) return
      const result = resolveShortcut(pending.current?.key ?? null, e.key)
      clear()
      if (!result) return
      if (result.type === 'pending')
        pending.current = { key: 'g', timer: window.setTimeout(clear, PENDING_MS) }
      else if (result.type === 'go') navigate(result.to)
      else if (result.type === 'search') {
        e.preventDefault()
        handlers.current.onSearch()
      } else handlers.current.onHelp()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      clear()
    }
  }, [enabled, navigate])
}
