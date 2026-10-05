import { Plus } from 'lucide-react'
import { CategoryIcon } from '@/components/catalog/CategoryIcon'
import { Button } from '@/components/ui/Button'
import { useDemoNotice } from '@/hooks/useDemoNotice'
import { getAllProductsIncludingDrafts, getCategories } from '@/services/catalogService'
import { AdminPageHeader } from './AdminPageHeader'

export default function CategoriesPage() {
  const notice = useDemoNotice()
  const products = getAllProductsIncludingDrafts()
  const countBy = (key: 'categoryId' | 'subcategoryId', id: string) =>
    products.filter((p) => p[key] === id).length

  return (
    <>
      <AdminPageHeader
        title="Categorías"
        description="Árbol de categorías de la tienda (solo lectura en la demo)."
        actions={
          <Button size="sm" onClick={notice}>
            <Plus size={16} aria-hidden="true" />
            Nueva categoría
          </Button>
        }
      />
      <div className="grid gap-4 min-[900px]:grid-cols-2">
        {getCategories().map((c) => (
          <section
            key={c.id}
            aria-labelledby={`cat-${c.id}`}
            className="rounded-card border border-light bg-white p-5"
          >
            <h2
              id={`cat-${c.id}`}
              className="mb-3 flex items-center gap-2.5 font-sans text-[15px] font-bold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light text-primary">
                <CategoryIcon name={c.icon} size={16} />
              </span>
              {c.name}
              <span className="ml-auto rounded-pill bg-light px-2.5 py-0.5 text-xs font-semibold text-muted">
                {countBy('categoryId', c.id)} productos
              </span>
            </h2>
            {c.groups.map((g) => (
              <div key={g.title} className="mb-2.5 last:mb-0">
                <h3 className="mb-1 font-sans text-[11.5px] font-bold tracking-[0.3px] text-primary uppercase">
                  {g.title}
                </h3>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {g.items.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-pill border border-light px-2.5 py-1 text-[12.5px] text-text"
                    >
                      {s.name}{' '}
                      <span className="text-subtle">({countBy('subcategoryId', s.id)})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  )
}
