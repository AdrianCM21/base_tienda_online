import { TextField, SelectField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { brand } from '@/config/brand'
import { useCurrency } from '@/hooks/useCurrency'
import { discountPercent } from '@/utils/productDraft'
import { installmentAmount } from '@/utils/format'
import { Card } from './Card'
import type { TabProps } from './types'

const digits = (s: string) => s.replace(/\D/g, '')

export function PricingTab({ draft, set }: TabProps) {
  const { price } = useCurrency()
  const off = discountPercent(draft.price, draft.oldPrice)
  const count = Number(draft.installments)
  const amount = Number(draft.price)
  return (
    <>
      <Card
        title="Precio"
        hint="Valores en guaraníes. Los clientes pueden verlos en dólares con el selector de moneda."
      >
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <TextField
            label="Precio de venta (Gs.)"
            inputMode="numeric"
            value={draft.price}
            onChange={(e) => set('price', digits(e.target.value))}
            hint={amount > 0 ? price(amount) : undefined}
          />
          <TextField
            label="Precio anterior (para ofertas)"
            inputMode="numeric"
            value={draft.oldPrice}
            onChange={(e) => set('oldPrice', digits(e.target.value))}
            hint={
              off > 0
                ? `Oferta del ${off}% — se muestra la etiqueta OFERTA y el precio tachado.`
                : 'Dejalo vacío si no está en oferta.'
            }
          />
        </div>
        {off > 0 && (
          <p
            role="status"
            className="mt-4 mb-0 rounded-control bg-light px-3.5 py-2.5 text-[13px] font-semibold text-dark"
          >
            Descuento de {off}% · ahorro de {price(Number(draft.oldPrice) - amount)}
          </p>
        )}
      </Card>

      <Card title="Financiación y envío">
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <SelectField
            label="Cuotas sin interés"
            value={draft.installments}
            onChange={(e) => set('installments', e.target.value)}
            hint={
              count > 1 && amount > 0
                ? `${count} cuotas de ${price(installmentAmount(amount, count))}`
                : 'Pago único'
            }
          >
            {[1, 3, 6, 10, 12, 18].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? 'Sin cuotas (pago único)' : `${n} cuotas`}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="mt-3">
          <Switch
            checked={draft.freeShipping}
            onChange={(v) => set('freeShipping', v)}
            label="Envío gratis en este producto"
            description={`Además, toda compra desde ${price(brand.freeShippingThreshold)} tiene envío gratis.`}
          />
        </div>
      </Card>
    </>
  )
}
