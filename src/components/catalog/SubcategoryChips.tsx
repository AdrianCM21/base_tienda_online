import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getSubcategories } from '@/services/catalogService'
import type { Category } from '@/types/category'

/** Accesos rápidos a las subcategorías de una categoría; resalta la activa. */
export function SubcategoryChips({
  category,
  activeSlug,
}: {
  category: Category
  activeSlug?: string
}) {
  return (
    <nav aria-label={`Subcategorías de ${category.name}`} className="mt-3.5">
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {getSubcategories(category).map((s) => {
          const active = s.slug === activeSlug
          return (
            <li key={s.slug}>
              <Link
                to={paths.category(category.slug, s.slug)}
                aria-current={active ? 'page' : undefined}
                className={`inline-block rounded-pill border px-3 py-1 text-[12.5px] font-semibold ${
                  active
                    ? 'border-primary bg-primary text-white hover:text-white'
                    : 'border-light bg-white text-dark hover:bg-light hover:text-dark'
                }`}
              >
                {s.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
