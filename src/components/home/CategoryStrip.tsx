import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getCategories } from '@/services/catalogService'
import { CategoryIcon } from '../catalog/CategoryIcon'

/** Accesos a las categorías en la portada: tarjetas con icono, en fila deslizable en móvil. */
export function CategoryStrip() {
  return (
    <nav aria-label="Comprar por categoría" className="bg-white px-6 pt-8 pb-2">
      <h2 className="mb-4 text-[22px] font-bold">Comprá por categoría</h2>
      <ul className="m-0 flex list-none gap-3 overflow-x-auto p-0 pb-3 min-[900px]:grid min-[900px]:grid-cols-5 min-[900px]:overflow-visible">
        {getCategories().map((c) => (
          <li key={c.slug} className="shrink-0 min-[900px]:shrink">
            <Link
              to={paths.category(c.slug)}
              className="flex h-full w-[132px] flex-col items-center gap-2.5 rounded-card border border-light px-3 py-4 text-center text-[13px] leading-tight font-semibold text-text transition-colors hover:border-primary hover:text-primary min-[900px]:w-auto"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-light text-primary">
                <CategoryIcon name={c.icon} size={24} />
              </span>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
