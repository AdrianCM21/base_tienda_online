import { useState } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { useAddToCart } from '@/hooks/useAddToCart'
import { useCurrency } from '@/hooks/useCurrency'
import { getCategory } from '@/services/catalogService'
import type { Product } from '@/types/product'
import { oldPriceFor, priceFor, stockFor } from '@/utils/product'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ColorSwatches } from './ColorSwatches'
import { ProductImage } from './ProductImage'

type Props = {
  product: Product
  /** Muestra la marca sobre el nombre (listados). */
  showBrand?: boolean
  /** Alto de la imagen en px (180 por defecto, 170 en relacionados). */
  imageHeight?: number
  /** Oculta el precio anterior (relacionados). */
  hideOldPrice?: boolean
}

export function ProductCard({
  product,
  showBrand = false,
  imageHeight = 180,
  hideOldPrice = false,
}: Props) {
  const { price, installments } = useCurrency()
  const addToCart = useAddToCart()
  const hasColors = product.colors.length > 0
  const [selected, setSelected] = useState(() =>
    Math.max(
      0,
      product.colors.findIndex((c) => c.stock > 0),
    ),
  )
  const color = hasColors ? product.colors[selected] : undefined

  const current = priceFor(product, color)
  const old = hideOldPrice ? undefined : oldPriceFor(product, color)
  const outOfStock = stockFor(product, color) <= 0
  const href = paths.product(product.slug, product.colors.length > 1 ? color?.name : undefined)
  const cuota = installments(current, product.installments?.count ?? 1)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-light bg-white transition-shadow duration-150 hover:shadow-card-hover">
      {old !== undefined && <Badge className="absolute top-2.5 left-2.5 z-10">OFERTA</Badge>}
      <Link
        to={href}
        aria-hidden="true"
        tabIndex={-1}
        className="block overflow-hidden"
        style={{ height: imageHeight }}
      >
        <ProductImage
          src={color?.images?.[0] ?? product.images[0]}
          alt=""
          icon={getCategory(product.categoryId)?.icon}
          tint={color?.hex}
          className={outOfStock ? 'opacity-50 grayscale' : ''}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {showBrand && (
          <span className="text-[11.5px] font-semibold tracking-[0.3px] text-subtle uppercase">
            {product.brand}
          </span>
        )}
        <h3 className="m-0 min-h-9 font-sans text-[13.5px] leading-[1.3] font-semibold">
          <Link to={href} className="text-text hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {hasColors && product.colors.length > 1 && (
          <ColorSwatches colors={product.colors} selected={selected} onSelect={setSelected} />
        )}
        <div className="mt-auto flex flex-col gap-1.5">
          {old !== undefined && (
            <span className="text-[12.5px] text-subtle line-through">{price(old)}</span>
          )}
          <span className="text-[19px] leading-tight font-bold text-primary">{price(current)}</span>
          <span className="min-h-4 text-xs text-muted">{cuota}</span>
          <Button
            variant="outline"
            size="sm"
            block
            disabled={outOfStock}
            onClick={() => addToCart(product, { colorName: color?.name })}
          >
            {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </article>
  )
}
