import { useEffect } from 'react'

/** Agrega `<meta name="robots" content="noindex">` mientras el componente está montado. */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}
