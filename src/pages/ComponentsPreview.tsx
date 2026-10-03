import { useState } from 'react'
import { CategorySidebar } from '@/components/catalog/CategorySidebar'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getAllProducts, getFeatured } from '@/services/catalogService'
import { themes } from '@/config/themes'
import { useTheme } from '@/hooks/useTheme'

/** Solo desarrollo (/componentes): galería para revisar los componentes compartidos. */
export default function ComponentsPreview() {
  useDocumentTitle('Componentes')
  const [page, setPage] = useState(2)
  const { theme, setTheme } = useTheme()
  const withColors = getAllProducts()
    .filter((p) => p.colors.length > 2)
    .slice(0, 4)
  return (
    <div className="flex items-start">
      <CategorySidebar />
      <div className="min-w-0 flex-1">
        <Breadcrumb
          items={[
            { label: 'Inicio', to: '/' },
            { label: 'Informática', to: '/' },
            { label: 'Notebooks' },
          ]}
        />
        <section className="space-y-4 px-6 py-8">
          <h1 className="text-[28px] font-bold">Componentes</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="white" className="border border-light">
              Blanco
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Deshabilitado</Button>
            <Badge>OFERTA</Badge>
            <Badge tone="muted">LENOVO</Badge>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tema">
            {themes.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={t.id === theme.id ? 'primary' : 'outline'}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <h2 className="pt-4 text-[22px] font-bold">Destacados</h2>
          <ProductGrid>
            {getFeatured().map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
          <h2 className="pt-4 text-[22px] font-bold">Con marca y varios colores</h2>
          <ProductGrid>
            {withColors.map((p) => (
              <ProductCard key={p.id} product={p} showBrand />
            ))}
          </ProductGrid>
          <Pagination page={page} pageCount={5} onPageChange={setPage} />
        </section>
      </div>
    </div>
  )
}
