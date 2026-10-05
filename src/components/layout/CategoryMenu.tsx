import { ChevronDown, LayoutGrid } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getCategories } from '@/services/catalogService'
import { CategoryIcon } from '../catalog/CategoryIcon'

/** Botón "Categorías" del encabezado (solo desde 900px) que abre un panel con todas las categorías y subcategorías. */
export function CategoryMenu() {
  // Al navegar cambia `key` y el componente se reinicia: el panel se cierra solo.
  const { key } = useLocation()
  return <CategoryMenuInner key={key} />
}

function CategoryMenuInner() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      root.current?.querySelector('button')?.focus()
    }
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, close])

  return (
    <div ref={root} className="hidden shrink-0 min-[900px]:block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-categorias"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-pill bg-white/10 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-white/20"
      >
        <LayoutGrid size={18} strokeWidth={1.8} aria-hidden="true" />
        Categorías
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <nav
          id="menu-categorias"
          aria-label="Todas las categorías"
          className="absolute inset-x-6 top-full z-40 mt-1 max-h-[75vh] overflow-y-auto rounded-card border border-light bg-white p-6 shadow-card-hover"
        >
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-8 gap-y-6 p-0">
            {getCategories().map((c) => (
              <li key={c.slug}>
                <Link
                  to={paths.category(c.slug)}
                  className="mb-2 flex items-center gap-2 text-[14px] font-bold text-text hover:text-primary"
                >
                  <CategoryIcon name={c.icon} size={18} className="shrink-0 text-primary" />
                  {c.name}
                </Link>
                <ul className="m-0 flex list-none flex-col gap-0.5 p-0 pl-[26px]">
                  {c.groups
                    .flatMap((g) => g.items)
                    .map((s) => (
                      <li key={s.slug}>
                        <Link
                          to={paths.category(s.slug)}
                          className="text-[13px] text-muted hover:text-primary"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
