import { useEffect } from 'react'
import { brand } from '@/config/brand'

/** Título de pestaña: "Página · Marca" (o solo la marca si no hay página). */
export function useDocumentTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} · ${brand.name}` : brand.name
  }, [page])
}
