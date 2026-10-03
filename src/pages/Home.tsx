import { CategorySidebar } from '@/components/catalog/CategorySidebar'
import { BankBenefits } from '@/components/home/BankBenefits'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Hero } from '@/components/home/Hero'
import { Newsletter } from '@/components/home/Newsletter'
import { ShippingStrip } from '@/components/home/ShippingStrip'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  return (
    <>
      <div className="flex items-start">
        <CategorySidebar className="hidden min-[900px]:block" />
        <div className="min-w-0 flex-1">
          <Hero />
          <BankBenefits />
        </div>
      </div>
      <FeaturedProducts />
      <ShippingStrip />
      <Newsletter />
    </>
  )
}
