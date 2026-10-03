import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getCategories } from '@/services/catalogService'

/** Lista compacta de categorías (sidebar del listado); la activa se resalta. */
export function CategoryList({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav aria-label="Categorías" className="mb-[18px]">
      <h2 className="m-0 mb-2.5 font-sans text-xs font-bold tracking-[0.5px] text-subtle uppercase">
        Categorías
      </h2>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {getCategories().map((c) => {
          const active = c.slug === activeSlug
          return (
            <li key={c.slug}>
              <Link
                to={paths.category(c.slug)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-between rounded-control px-2.5 py-2 text-[13.5px] ${
                  active
                    ? 'bg-light font-bold text-primary'
                    : 'text-text hover:bg-light hover:text-text'
                }`}
              >
                {c.name}
                <span aria-hidden="true" className="text-subtle">
                  ›
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
