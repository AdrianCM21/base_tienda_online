import { BankBenefits } from '@/components/home/BankBenefits'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Hero } from '@/components/home/Hero'
import { Newsletter } from '@/components/home/Newsletter'
import { OffersRow } from '@/components/home/OffersRow'
import { ShippingStrip } from '@/components/home/ShippingStrip'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <CategoryStrip />
      <OffersRow />
      <BankBenefits />
      <FeaturedProducts />
      <ShippingStrip />
      <Newsletter />
    </>
  )
}
