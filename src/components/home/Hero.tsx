import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'
import { useCurrency } from '@/hooks/useCurrency'
import { getCategory, getOnSale } from '@/services/catalogService'
import { ProductImage } from '../catalog/ProductImage'
import { buttonClasses } from '../ui/button-styles'

/** Tarjetas de ofertas que "flotan" sobre el panel de color (hasta tener una imagen propia en `brand.heroImage`). */
function HeroOffers() {
  const { price } = useCurrency()
  const offers = getOnSale(3)
  const tilt = ['-rotate-2', 'rotate-1 sm:translate-x-8', '-rotate-1 sm:-translate-x-2']
  return (
    <ul className="m-0 flex w-full min-w-0 list-none flex-col gap-3 p-0">
      {offers.map((p, i) => (
        <li key={p.id} className={`min-w-0 ${tilt[i]}`}>
          <Link
            to={paths.product(p.slug)}
            className="flex min-w-0 items-center gap-3 rounded-card bg-white p-2.5 pr-4 text-text shadow-card-hover hover:text-text"
          >
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-control">
              <ProductImage alt="" icon={getCategory(p.categoryId)?.icon} tint={p.colors[0]?.hex} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">{p.name}</span>
              <span className="text-[15px] font-bold text-primary">{price(p.price)}</span>{' '}
              <span className="text-xs text-subtle line-through">{price(p.oldPrice!)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Hero() {
  return (
    <section className="px-6 pt-6">
      <div className="grid grid-cols-1 overflow-hidden rounded-hero bg-light min-[900px]:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col items-start justify-center px-7 py-10 sm:px-12 sm:py-14">
          <div className="mb-4 inline-block rounded-pill bg-white px-3.5 py-[5px] text-[12.5px] font-semibold text-primary">
            Financiación propia
          </div>
          <h1 className="mb-4 max-w-[520px] text-[32px] leading-[1.15] font-extrabold text-dark sm:text-[42px]">
            Hasta 18 cuotas sin interés en toda la tienda
          </h1>
          <p className="mb-7 max-w-[480px] text-base leading-normal text-muted">
            Comprá hoy y pagá cómodo con tu tarjeta de crédito. Válido en computación, celulares y
            electrodomésticos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={paths.offers} className={buttonClasses('primary', 'lg')}>
              Ver ofertas
            </Link>
            <Link to={paths.search()} className={buttonClasses('outline', 'lg')}>
              Explorar todo
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center bg-primary px-7 py-10 min-[900px]:rounded-l-[48px]">
          {brand.heroImage ? (
            <img
              src={brand.heroImage}
              alt=""
              className="h-[300px] w-full rounded-hero object-cover"
            />
          ) : (
            <HeroOffers />
          )}
        </div>
      </div>
    </section>
  )
}
