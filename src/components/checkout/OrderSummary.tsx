import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
import type { OrderLine } from '@/types/order'
import { ProductImage } from '../catalog/ProductImage'

type Props = {
  lines: (OrderLine & { icon?: string; hex?: string })[]
  subtotal: number
  shipping: number
  total: number
  /** Máximo de cuotas para mostrar "o N cuotas de X" (0/1 = no mostrar). */
  maxInstallments?: number
  footer?: ReactNode
}

/** "Resumen del pedido" (sticky) con ítems, subtotal, envío y total. */
export function OrderSummary({
  lines,
  subtotal,
  shipping,
  total,
  maxInstallments = 0,
  footer,
}: Props) {
  const { price, installments } = useCurrency()
  const cuota = maxInstallments > 1 ? installments(total, maxInstallments) : null
  return (
    <aside
      aria-label="Resumen del pedido"
      className="self-start rounded-card border border-light bg-white p-[22px] min-[900px]:sticky min-[900px]:top-[calc(var(--demo-bar-h,0px)+24px)]"
    >
      <h2 className="mb-4 font-sans text-[15px] font-bold">Resumen del pedido</h2>
      <ul className="m-0 mb-[18px] flex list-none flex-col gap-3.5 p-0">
        {lines.map((l) => (
          <li key={`${l.productId}|${l.colorName ?? ''}`} className="flex gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-control border border-light">
              <ProductImage alt="" icon={l.icon} tint={l.hex} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] leading-[1.3] font-semibold">{l.name}</div>
              <div className="text-xs text-subtle">
                Cantidad: {l.quantity}
                {l.colorName && ` · ${l.colorName}`}
              </div>
            </div>
            <div className="shrink-0 text-[13.5px] font-bold text-primary">
              {price(l.lineTotal)}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-light pt-3.5 text-[13.5px]">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{price(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Envío</span>
          <span className={shipping === 0 ? 'font-semibold text-primary' : ''}>
            {shipping === 0 ? 'Gratis' : price(shipping)}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-light pt-3">
        <span className="text-[15px] font-bold">Total</span>
        <span className="text-2xl font-bold text-primary">{price(total)}</span>
      </div>
      <div className="mb-[18px] min-h-4 text-xs text-muted">
        {cuota && `o ${cuota} sin interés`}
      </div>
      {footer}
      <p className="mt-3.5 mb-0 flex items-center justify-center gap-2 text-xs text-subtle">
        <Lock size={14} strokeWidth={1.6} aria-hidden="true" />
        Pago procesado de forma segura
      </p>
    </aside>
  )
}
