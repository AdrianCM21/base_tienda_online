import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/button-styles'
import { paths } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useNoIndex } from '@/hooks/useNoIndex'

export default function NotFound() {
  useDocumentTitle('Página no encontrada')
  useNoIndex()
  return (
    <section className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light text-primary">
        <SearchX size={26} aria-hidden="true" />
      </div>
      <p className="m-0 mb-1 text-xs font-bold tracking-wide text-subtle uppercase">Error 404</p>
      <h1 className="m-0 mb-2 text-[28px] font-bold">Página no encontrada</h1>
      <p className="m-0 mb-6 text-[14.5px] text-muted">
        La dirección que buscás no existe o fue movida. Probá desde el inicio o explorá el catálogo.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={paths.home} className={buttonClasses('primary')}>
          Volver al inicio
        </Link>
        <Link to={paths.search()} className={buttonClasses('outline')}>
          Ver productos
        </Link>
      </div>
    </section>
  )
}
