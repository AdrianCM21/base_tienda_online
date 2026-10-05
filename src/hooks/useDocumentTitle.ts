import { useEffect } from 'react'
import { brand } from '@/config/brand'

/** Descripción por defecto (la misma que lleva index.html). */
export const defaultDescription = `${brand.name} — ${brand.tagline}`

/**
 * Título de pestaña ("Página · Marca") y meta description de la ruta.
 * Sin `description` se vuelve a la descripción general de la tienda.
 */
export function useDocumentTitle(page?: string, description?: string) {
  useEffect(() => {
    document.title = page ? `${page} · ${brand.name}` : brand.name
  }, [page])

  useEffect(() => {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = (description ?? defaultDescription).slice(0, 160)
  }, [description])
}
