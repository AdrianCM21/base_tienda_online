import { useEffect } from 'react'
import { markVisited, type VisitKey } from '@/utils/adminProgress'

/** Marca la pantalla como visitada (alimenta el checklist de inicio del panel). */
export function useVisitedPage(key: VisitKey) {
  useEffect(() => {
    markVisited(key)
  }, [key])
}
