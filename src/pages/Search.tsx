import { ListingPage } from '@/components/catalog/ListingPage'
import { paths } from '@/config/routes'
import { useCatalogParams } from '@/hooks/useCatalogParams'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Search() {
  const { state } = useCatalogParams()
  const { q, onlyOffer } = state.filters
  const title = q ? `Resultados para “${q}”` : onlyOffer ? 'Ofertas' : 'Todos los productos'
  useDocumentTitle(title)
  return (
    <ListingPage
      breadcrumb={[{ label: 'Inicio', to: paths.home }, { label: q ? 'Búsqueda' : title }]}
      title={title}
      subtitle={q ? undefined : 'Explorá todo el catálogo'}
      emptyHint="Revisá la ortografía o probá con una palabra más general, como la marca o el tipo de producto."
    />
  )
}
