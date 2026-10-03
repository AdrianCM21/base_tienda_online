import { getRelated } from '@/services/catalogService'
import type { Product } from '@/types/product'
import { ProductCard } from '../catalog/ProductCard'
import { ProductGrid } from '../catalog/ProductGrid'

export function RelatedProducts({ product }: { product: Product }) {
  const related = getRelated(product, 4)
  if (!related.length) return null
  return (
    <section className="px-6 pb-12">
      <h2 className="mb-[18px] text-[22px] font-bold">Productos relacionados</h2>
      <ProductGrid>
        {related.map((p) => (
          <ProductCard key={p.id} product={p} imageHeight={170} hideOldPrice />
        ))}
      </ProductGrid>
    </section>
  )
}
