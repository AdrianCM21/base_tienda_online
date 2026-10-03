import { useCurrency } from '@/hooks/useCurrency'
import { getBranches } from '@/services/storeService'
import type { CardData, PaymentMethod } from '@/types/checkout'
import type { FieldErrors } from '@/utils/checkout'
import { formatCardNumber, formatExpiry } from '@/utils/validators'
import { SelectField, TextField } from '../ui/FormField'

type Props = {
  method: PaymentMethod
  onMethodChange: (m: PaymentMethod) => void
  card: CardData
  cardErrors: FieldErrors<CardData>
  onCardChange: (c: CardData) => void
  installments: number
  installmentChoices: { count: number; amount: number }[]
  onInstallmentsChange: (n: number) => void
  branchId: string
  branchError?: string
  onBranchChange: (id: string) => void
  accepted: boolean
  onAcceptedChange: (v: boolean) => void
  termsError?: string
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'tarjeta', label: 'Tarjeta de crédito/débito' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo en sucursal' },
]

export function PaymentForm(p: Props) {
  const { price } = useCurrency()
  const setCard = <K extends keyof CardData>(key: K, v: string) =>
    p.onCardChange({ ...p.card, [key]: v })
  return (
    <section
      aria-labelledby="pago-titulo"
      className="rounded-card border border-light bg-white p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
          2
        </span>
        <h2 id="pago-titulo" className="m-0 font-sans text-[15px] font-bold">
          2. Forma de pago
        </h2>
      </div>

      <fieldset className="m-0 mb-5 flex min-w-0 flex-wrap gap-2.5 border-0 p-0">
        <legend className="sr-only">Método de pago</legend>
        {METHODS.map((m) => {
          const selected = p.method === m.value
          return (
            <label
              key={m.value}
              className={`flex min-w-[150px] flex-1 cursor-pointer items-center gap-2 rounded-control border-[1.5px] px-3.5 py-3 text-[13.5px] font-semibold ${
                selected ? 'border-primary bg-light' : 'border-light text-muted'
              }`}
            >
              <input
                type="radio"
                name="pago"
                className="accent-primary"
                checked={selected}
                onChange={() => p.onMethodChange(m.value)}
              />
              {m.label}
            </label>
          )
        })}
      </fieldset>

      {p.method === 'tarjeta' && (
        <div className="flex flex-col gap-3.5">
          <TextField
            label="Número de tarjeta"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            hint="Demo: probá con 4242 4242 4242 4242"
            value={p.card.number}
            error={p.cardErrors.number}
            onChange={(e) => setCard('number', formatCardNumber(e.target.value))}
          />
          <TextField
            label="Nombre en la tarjeta"
            autoComplete="cc-name"
            placeholder="Como figura en la tarjeta"
            value={p.card.name}
            error={p.cardErrors.name}
            onChange={(e) => setCard('name', e.target.value)}
          />
          <div className="flex gap-3.5">
            <TextField
              className="flex-1"
              label="Vencimiento"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              maxLength={5}
              value={p.card.expiry}
              error={p.cardErrors.expiry}
              onChange={(e) => setCard('expiry', formatExpiry(e.target.value))}
            />
            <TextField
              className="flex-1"
              label="CVV"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              value={p.card.cvv}
              error={p.cardErrors.cvv}
              onChange={(e) => setCard('cvv', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <SelectField
            label="Cuotas"
            value={p.installments}
            onChange={(e) => p.onInstallmentsChange(Number(e.target.value))}
          >
            {p.installmentChoices.map((o) => (
              <option key={o.count} value={o.count}>
                {o.count === 1
                  ? `1 pago — ${price(o.amount)}`
                  : `${o.count} cuotas sin interés — ${price(o.amount)}/mes`}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {p.method === 'transferencia' && (
        <div className="rounded-card bg-light px-4 py-3.5 text-[13.5px] text-dark">
          <p className="m-0 mb-2 font-semibold">Datos para la transferencia (ejemplo)</p>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {[
              ['Banco', 'Banco Meridiano'],
              ['Titular', 'Tienda Demo S.A.'],
              ['Cuenta corriente', '00-1234567-8'],
              ['RUC', '80000000-0'],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="m-0 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2.5 mb-0 text-xs text-muted">
            Son datos de ejemplo: esta demo no recibe transferencias.
          </p>
        </div>
      )}

      {p.method === 'efectivo' && (
        <SelectField
          label="Sucursal donde vas a pagar"
          value={p.branchId}
          error={p.branchError}
          onChange={(e) => p.onBranchChange(e.target.value)}
        >
          <option value="">Elegí una sucursal</option>
          {getBranches().map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.hours}
            </option>
          ))}
        </SelectField>
      )}

      <label className="mt-[18px] flex cursor-pointer items-start gap-2 text-[12.5px] text-muted">
        <input
          type="checkbox"
          className="mt-0.5 accent-primary"
          checked={p.accepted}
          onChange={(e) => p.onAcceptedChange(e.target.checked)}
        />
        <span>Acepto los términos y condiciones y la política de privacidad.</span>
      </label>
      {p.termsError && (
        <p className="mt-1 mb-0 text-xs font-semibold text-red-700">{p.termsError}</p>
      )}
    </section>
  )
}
