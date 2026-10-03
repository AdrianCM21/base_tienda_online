import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getFeatured } from '@/services/catalogService'
import { ProductCard } from '../catalog/ProductCard'
import { ProductGrid } from '../catalog/ProductGrid'

export function FeaturedProducts() {
  return (
    <section className="px-6 py-12">
      <div className="mb-[22px] flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[26px] font-bold">Productos destacados</h2>
        <Link to={paths.search()} className="text-sm font-semibold">
          Ver todos →
        </Link>
      </div>
      <ProductGrid>
        {getFeatured(8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ProductGrid>
    </section>
  )
}
