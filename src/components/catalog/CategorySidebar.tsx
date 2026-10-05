import { useState } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getCategories } from '@/services/catalogService'
import { CategoryIcon } from './CategoryIcon'

type Props = {
  /** Categoría abierta al inicio. */
  defaultOpen?: string
  /** Sin sticky ni ancho fijo: para usarlo dentro de un Drawer. */
  embedded?: boolean
  className?: string
}

/** Barra lateral de categorías (acordeón: una sola abierta). */
export function CategorySidebar({
  defaultOpen = 'informatica',
  embedded = false,
  className = '',
}: Props) {
  const categories = getCategories()
  const [open, setOpen] = useState<string | null>(defaultOpen)

  // Embebido (dentro del drawer) no es un landmark propio: el diálogo ya tiene nombre.
  const Root = embedded ? 'div' : 'aside'
  return (
    <Root
      {...(embedded ? {} : { 'aria-label': 'Categorías' })}
      className={`bg-white py-[18px] ${
        embedded
          ? ''
          : 'sticky top-[var(--demo-bar-h,0px)] w-[264px] shrink-0 self-start border-r border-light'
      } ${className}`}
    >
      {!embedded && (
        <h2 className="m-0 px-5 pb-3 font-sans text-xs font-bold tracking-[0.5px] text-subtle uppercase">
          Categorías
        </h2>
      )}
      <ul className="m-0 list-none p-0">
        {categories.map((c) => {
          const isOpen = open === c.slug
          return (
            <li key={c.slug} className={isOpen ? 'bg-light' : ''}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`sub-${c.slug}`}
                onClick={() => setOpen(isOpen ? null : c.slug)}
                className={`flex w-full items-center gap-2.5 px-5 py-3 text-left text-[13.5px] hover:bg-light ${
                  isOpen ? 'font-bold text-primary' : 'font-semibold text-text'
                }`}
              >
                <CategoryIcon name={c.icon} size={18} className="shrink-0 text-primary" />
                {c.name}
              </button>
              {isOpen && (
                <div id={`sub-${c.slug}`} className="flex flex-col gap-0.5 pr-5 pb-3.5 pl-12">
                  {c.groups.map((g, gi) => (
                    <div key={g.title} className="flex flex-col gap-0.5">
                      <span
                        className={`text-xs font-bold tracking-[0.3px] text-primary uppercase ${gi === 0 ? 'mt-1.5' : 'mt-2'}`}
                      >
                        {g.title}
                      </span>
                      {g.items.map((s) => (
                        <Link
                          key={s.slug}
                          to={paths.category(s.slug)}
                          className="py-[3px] text-[13px] text-text hover:text-primary"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link to={paths.category(c.slug)} className="mt-2 text-[12.5px] font-semibold">
                    Ver todo en {c.name} →
                  </Link>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Root>
  )
}
