import { Camera, Laptop, Refrigerator, Sofa, Tv, Hammer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'
import { buttonClasses } from '../ui/button-styles'

const TILES = [Laptop, Tv, Refrigerator, Camera, Sofa, Hammer]

/** Ilustración por defecto (hasta tener una imagen propia en `brand.heroImage`). */
function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative grid h-[300px] grid-cols-3 content-center gap-4 rounded-hero bg-white/10 p-6 ring-1 ring-white/20"
    >
      {TILES.map((Icon, i) => (
        <div
          key={i}
          className={`flex aspect-square items-center justify-center rounded-card bg-white/15 text-white ${i % 2 ? 'translate-y-1.5' : '-translate-y-1.5'}`}
        >
          <Icon size={34} strokeWidth={1.4} />
        </div>
      ))}
      <span className="absolute right-4 bottom-4 rounded-pill bg-white px-3 py-1 text-[12.5px] font-bold text-dark">
        Hasta 18 cuotas
      </span>
    </div>
  )
}

export function Hero() {
  return (
    <section className="flex flex-wrap items-center gap-10 bg-[linear-gradient(135deg,var(--color-dark),var(--color-primary))] px-6 py-14">
      <div className="max-w-[540px] min-w-[min(280px,100%)] flex-[1_1_320px]">
        <div className="mb-4 inline-block rounded-pill bg-white/15 px-3.5 py-[5px] text-[12.5px] font-semibold text-white">
          Financiación propia
        </div>
        <h1 className="mb-4 text-[32px] leading-[1.15] font-bold text-white sm:text-[40px]">
          Hasta 18 cuotas sin interés en toda la tienda
        </h1>
        <p className="mb-[26px] text-base leading-normal text-hero-text">
          Comprá hoy y pagá cómodo con tu tarjeta de crédito. Válido en informática, electrónica y
          electrodomésticos.
        </p>
        <Link to={paths.offers} className={buttonClasses('white', 'lg')}>
          Ver ofertas
        </Link>
      </div>
      <div className="max-w-[460px] min-w-[min(200px,100%)] flex-[1_1_240px]">
        {brand.heroImage ? (
          <img
            src={brand.heroImage}
            alt=""
            className="h-[300px] w-full rounded-hero object-cover"
          />
        ) : (
          <HeroVisual />
        )}
      </div>
    </section>
  )
}
