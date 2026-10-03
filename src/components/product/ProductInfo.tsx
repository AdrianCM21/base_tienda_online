import { Check, CreditCard, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/config/routes'
import { useAddToCart } from '@/hooks/useAddToCart'
import { useCart } from '@/hooks/useCart'
import { useCurrency } from '@/hooks/useCurrency'
import { getBanks } from '@/services/catalogService'
import type { Product } from '@/types/product'
import { oldPriceFor, priceFor, stockFor } from '@/utils/product'
import { ColorSwatches } from '../catalog/ColorSwatches'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { buttonClasses } from '../ui/button-styles'
import { DemoLink } from '../ui/DemoLink'
import { QuantityStepper } from '../ui/QuantityStepper'
import { Stars } from '../ui/Stars'

type Props = {
  product: Product
  colorIndex: number
  onColorChange: (index: number) => void
}

const LOW_STOCK = 5

export function ProductInfo({ product, colorIndex, onColorChange }: Props) {
  const navigate = useNavigate()
  const { price, installments } = useCurrency()
  const addToCart = useAddToCart()
  const { add } = useCart()
  const [requested, setRequested] = useState(1)

  const color = product.colors[colorIndex]
  const stock = stockFor(product, color)
  const quantity = Math.min(Math.max(1, requested), Math.max(1, stock))
  const current = priceFor(product, color)
  const old = oldPriceFor(product, color)
  const count = product.installments?.count ?? 1
  const cuota = installments(current, count)
  const bank = getBanks()[0]
  const colorName = color?.name
  const sku = color?.sku ?? product.sku

  const buyNow = () => {
    add(product, { colorName, quantity })
    navigate(paths.checkout)
  }

  return (
    <div>
      <span className="mb-2.5 inline-block rounded-[4px] bg-light px-2.5 py-1 text-[11.5px] font-bold tracking-[0.3px] text-dark uppercase">
        {product.brand}
      </span>
      <h1 className="mb-2.5 text-[26px] leading-tight font-bold">{product.name}</h1>
      <div className="mb-[18px] flex flex-wrap items-center gap-2">
        {product.rating !== undefined && <Stars rating={product.rating} />}
        {product.rating !== undefined && (
          <span className="text-[13px] text-muted">
            {product.rating.toFixed(1)} ({product.reviewCount ?? 0} opiniones)
          </span>
        )}
        <span className="text-[13px] text-subtle">| SKU {sku}</span>
      </div>

      <div className="mb-5 rounded-card border border-light bg-white p-5">
        {old !== undefined && <Badge className="mb-2.5">OFERTA</Badge>}
        {old !== undefined && <div className="text-sm text-subtle line-through">{price(old)}</div>}
        <div className="text-[34px] leading-[1.2] font-bold text-primary">{price(current)}</div>
        {old !== undefined && (
          <div className="mt-1 text-[13px] text-muted">Ahorrás {price(old - current)}</div>
        )}
        {cuota && <div className="mt-2.5 text-sm font-semibold text-dark">{cuota} sin interés</div>}
      </div>

      {product.colors.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-[13.5px]">
            <span className="text-muted">Color: </span>
            <span className="font-semibold">{color.name}</span>
            {color.stock <= 0 && (
              <span className="ml-2 text-[12.5px] text-subtle">(sin stock)</span>
            )}
          </div>
          {product.colors.length > 1 && (
            <ColorSwatches
              colors={product.colors}
              selected={colorIndex}
              onSelect={(i) => {
                onColorChange(i)
                setRequested(1)
              }}
              max={product.colors.length}
              size="md"
              selectOnHover={false}
            />
          )}
        </div>
      )}

      <div
        className={`mb-5 flex items-center gap-2 text-[13.5px] font-semibold ${stock > 0 ? 'text-primary' : 'text-red-700'}`}
        aria-live="polite"
      >
        {stock > 0 ? (
          <Check size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <X size={16} strokeWidth={2} aria-hidden="true" />
        )}
        {stock <= 0
          ? 'Sin stock por el momento'
          : stock <= LOW_STOCK
            ? `¡Últimas ${stock} ${stock === 1 ? 'unidad' : 'unidades'}! — Envío en 24 a 48hs`
            : 'En stock — Envío en 24 a 48hs'}
      </div>

      <div className="mb-4 flex gap-3">
        <QuantityStepper
          value={quantity}
          max={Math.max(1, stock)}
          onChange={setRequested}
          disabled={stock <= 0}
        />
        <Button
          variant="outline"
          className="flex-1 py-3 text-[14.5px] font-bold"
          disabled={stock <= 0}
          onClick={() => addToCart(product, { colorName, quantity })}
        >
          Agregar al carrito
        </Button>
      </div>
      <button
        type="button"
        disabled={stock <= 0}
        onClick={buyNow}
        className={`${buttonClasses('primary', 'md', true)} mb-5 py-[13px] text-[14.5px]`}
      >
        Comprar ahora
      </button>

      {bank && (
        <div className="mb-[22px] flex items-center gap-2.5 rounded-card bg-light px-4 py-3.5 text-[13px] text-dark">
          <CreditCard size={18} strokeWidth={1.6} className="shrink-0" aria-hidden="true" />
          <p className="m-0">
            {bank.benefit} con {bank.name}: {bank.condition.toLowerCase()}.{' '}
            <DemoLink
              className="inline font-semibold text-primary hover:text-dark"
              message="Los beneficios no están disponibles en la demo"
            >
              Ver todos los beneficios →
            </DemoLink>
          </p>
        </div>
      )}

      <div className="border-t border-light pt-4">
        <h2 className="mb-2.5 font-sans text-sm font-bold">Especificaciones principales</h2>
        <dl className="m-0 grid grid-cols-2 gap-x-5 gap-y-2 text-[13.5px]">
          {Object.entries(product.specs)
            .slice(0, 5)
            .map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="m-0 font-semibold">{v}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  )
}
