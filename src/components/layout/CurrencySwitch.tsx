import { useCurrency } from '@/hooks/useCurrency'
import type { Currency } from '@/types/currency'

const OPTIONS: Currency[] = ['Gs', 'USD']

/** Selector de moneda (Gs / USD) en forma de píldora. */
export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency()
  return (
    <div role="radiogroup" aria-label="Moneda" className="flex rounded-pill bg-white/[0.08] p-0.5">
      {OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={currency === c}
          onClick={() => setCurrency(c)}
          className={`rounded-[18px] px-2.5 py-[3px] text-xs ${currency === c ? 'bg-primary font-semibold text-white' : 'text-on-dark'}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
