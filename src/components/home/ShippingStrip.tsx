import { Truck } from 'lucide-react'
import { brand } from '@/config/brand'
import { useCurrency } from '@/hooks/useCurrency'
import { DemoLink } from '../ui/DemoLink'

export function ShippingStrip() {
  const { price } = useCurrency()
  return (
    <section className="flex flex-wrap items-center justify-center gap-4 bg-dark px-6 py-[30px] text-center">
      <Truck size={30} strokeWidth={1.6} className="text-hero-text" aria-hidden="true" />
      <p className="m-0 text-base font-semibold text-white">
        Envío gratis en compras superiores a {price(brand.freeShippingThreshold)} a todo el país
      </p>
      <DemoLink
        className="text-sm font-semibold text-on-dark-link underline hover:text-white"
        message="La política de envíos no está disponible en la demo"
      >
        Conocer más
      </DemoLink>
    </section>
  )
}
