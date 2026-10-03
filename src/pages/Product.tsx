import { useParams, useSearchParams } from 'react-router-dom'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductTabs } from '@/components/product/ProductTabs'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { paths } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getCategory, getProduct, getSubcategory } from '@/services/catalogService'
import NotFound from './NotFound'

export default function Product() {
  const { slug = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const product = getProduct(slug)
  useDocumentTitle(product?.name)
  if (!product) return <NotFound />

  const category = getCategory(product.categoryId)
  const sub = getSubcategory(product.subcategoryId)?.subcategory

  // El color elegido vive en la URL (?color=) para poder compartir el enlace.
  const fromUrl = product.colors.findIndex((c) => c.name === searchParams.get('color'))
  const firstInStock = product.colors.findIndex((c) => c.stock > 0)
  const colorIndex = fromUrl >= 0 ? fromUrl : Math.max(0, firstInStock)
  const selectColor = (i: number) => {
    if (product.colors.length > 1)
      setSearchParams({ color: product.colors[i].name }, { replace: true })
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Inicio', to: paths.home },
          ...(category ? [{ label: category.name, to: paths.category(category.slug) }] : []),
          ...(category && sub ? [{ label: sub.name, to: paths.category(sub.slug) }] : []),
          { label: product.name },
        ]}
      />
      <section className="grid grid-cols-1 gap-9 px-6 pt-5 min-[900px]:grid-cols-[minmax(280px,1fr)_minmax(320px,1fr)]">
        <ProductGallery
          // Al cambiar de color o de producto se vuelve a la primera imagen.
          key={`${product.id}:${colorIndex}`}
          product={product}
          color={product.colors[colorIndex]}
          icon={category?.icon}
        />
        <ProductInfo
          key={product.id}
          product={product}
          colorIndex={colorIndex}
          onColorChange={selectColor}
        />
      </section>
      <ProductTabs product={product} />
      <RelatedProducts product={product} />
    </>
  )
}
