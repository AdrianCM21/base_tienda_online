import { useParams } from 'react-router-dom'
import { ListingPage } from '@/components/catalog/ListingPage'
import { SubcategoryChips } from '@/components/catalog/SubcategoryChips'
import { paths } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { resolveListing } from '@/services/catalogService'
import NotFound from './NotFound'

export default function Category() {
  const { slug = '', sub } = useParams()
  const resolved = resolveListing(slug, sub)
  useDocumentTitle(resolved ? (resolved.subcategory ?? resolved.category).name : undefined)
  if (!resolved) return <NotFound />

  const { category, subcategory } = resolved
  return (
    <ListingPage
      // Al cambiar de categoría se reinicia el estado local (drawer, scroll).
      key={`${category.slug}/${subcategory?.slug ?? ''}`}
      breadcrumb={[
        { label: 'Inicio', to: paths.home },
        { label: category.name, to: subcategory ? paths.category(category.slug) : undefined },
        ...(subcategory ? [{ label: subcategory.name }] : []),
      ]}
      title={(subcategory ?? category).name}
      category={category.slug}
      subcategory={subcategory?.slug}
      activeCategory={category.slug}
      extra={<SubcategoryChips category={category} activeSlug={subcategory?.slug} />}
    />
  )
}
