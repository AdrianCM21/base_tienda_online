import { useState } from 'react'
import type { ColorVariant, Product } from '@/types/product'
import { ProductImage } from '../catalog/ProductImage'

type Props = {
  product: Product
  color?: ColorVariant
  icon?: string
}

const THUMBS = 4

/** Imagen principal (380px) + 4 miniaturas. Sin fotos reales se usan vistas de placeholder. */
export function ProductGallery({ product, color, icon }: Props) {
  const real = color?.images?.length ? color.images : product.images
  const count = real.length ? Math.min(Math.max(real.length, 1), THUMBS) : THUMBS
  const [index, setIndex] = useState(0)
  const current = Math.min(index, count - 1)

  const render = (i: number, alt: string) => (
    <ProductImage src={real[i]} alt={alt} icon={icon} tint={color?.hex} view={i} />
  )

  return (
    <div>
      <div className="h-[380px] overflow-hidden rounded-card border border-light bg-white">
        {render(
          current,
          `${product.name}, vista ${current + 1}${color ? ` en ${color.name}` : ''}`,
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ver imagen ${i + 1}`}
            aria-pressed={i === current}
            onClick={() => setIndex(i)}
            className={`h-[78px] overflow-hidden rounded-card border-2 bg-white ${i === current ? 'border-primary' : 'border-light hover:border-subtle'}`}
          >
            {render(i, '')}
          </button>
        ))}
      </div>
    </div>
  )
}
