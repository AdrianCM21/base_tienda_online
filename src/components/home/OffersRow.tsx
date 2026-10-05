import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { getOnSale } from '@/services/catalogService'
import { ProductCard } from '../catalog/ProductCard'
import { ProductGrid } from '../catalog/ProductGrid'

/** Fila de ofertas de la portada (las que no aparecen en el banner principal). */
export function OffersRow() {
  return (
    <section aria-labelledby="ofertas-titulo" className="px-6 pt-8 pb-4">
      <div className="mb-[22px] flex items-baseline justify-between gap-4">
        <h2 id="ofertas-titulo" className="m-0 text-[26px] font-extrabold">
          Ofertas de la semana
        </h2>
        <Link to={paths.offers} className="text-sm font-semibold">
          Ver todas →
        </Link>
      </div>
      <ProductGrid>
        {getOnSale(4, 3).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ProductGrid>
    </section>
  )
}
