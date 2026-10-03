import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { useCart } from '@/hooks/useCart'
import { useCurrency } from '@/hooks/useCurrency'
import { getCategory } from '@/services/catalogService'
import type { CartLine } from '@/types/cart'
import { ProductImage } from '../catalog/ProductImage'
import { QuantityStepper } from '../ui/QuantityStepper'

type Props = {
  line: CartLine
  /** Versión reducida para el mini-carrito. */
  compact?: boolean
  /** Se llama al navegar a la ficha (p. ej. para cerrar el drawer). */
  onNavigate?: () => void
}

export function CartLineRow({ line, compact = false, onNavigate }: Props) {
  const { setQuantity, remove } = useCart()
  const { price } = useCurrency()
  const { product, color } = line
  const href = paths.product(product.slug, product.colors.length > 1 ? color?.name : undefined)
  const size = compact ? 'h-16 w-16' : 'h-24 w-24'

  return (
    <li className="flex gap-3.5 py-4">
      <Link
        to={href}
        onClick={onNavigate}
        aria-hidden="true"
        tabIndex={-1}
        className={`${size} shrink-0 overflow-hidden rounded-card border border-light`}
      >
        <ProductImage
          alt=""
          src={color?.images?.[0] ?? product.images[0]}
          icon={getCategory(product.categoryId)?.icon}
          tint={color?.hex}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={href}
              onClick={onNavigate}
              className="block text-[13.5px] leading-[1.3] font-semibold text-text hover:text-primary"
            >
              {product.name}
            </Link>
            {color && (
              <span className="mt-1 flex items-center gap-1.5 text-xs text-subtle">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full border border-black/15"
                  style={{ background: color.hex }}
                />
                {color.name}
              </span>
            )}
          </div>
          <span className="shrink-0 text-[13.5px] font-bold text-primary">
            {price(line.lineTotal)}
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            size="sm"
            label={`Cantidad de ${product.name}`}
            value={line.quantity}
            max={line.maxQuantity}
            onChange={(q) => setQuantity(line.key, q)}
          />
          <div className="flex items-center gap-3">
            {line.quantity > 1 && (
              <span className="text-xs text-subtle">{price(line.unitPrice)} c/u</span>
            )}
            <button
              type="button"
              onClick={() => remove(line.key)}
              aria-label={`Quitar ${product.name} del carrito`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-red-700"
            >
              <Trash2 size={14} aria-hidden="true" />
              Quitar
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
