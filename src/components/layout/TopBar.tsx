import { useCurrency } from '@/hooks/useCurrency'
import type { Currency } from '@/types/currency'
import { DemoLink } from '../ui/DemoLink'

const OPTIONS: Currency[] = ['Gs', 'USD']

export function TopBar() {
  const { currency, setCurrency } = useCurrency()
  return (
    <div className="flex items-center justify-between gap-3 bg-dark px-6 py-1.5 text-xs text-on-dark">
      <span className="hidden sm:inline">Envíos a todo Paraguay | Retiro gratis en sucursales</span>
      <div className="ml-auto flex items-center gap-[18px]">
        <div
          role="radiogroup"
          aria-label="Moneda"
          className="flex rounded-pill bg-white/[0.08] p-0.5"
        >
          {OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={currency === c}
              onClick={() => setCurrency(c)}
              className={`rounded-[18px] px-2.5 py-[3px] ${currency === c ? 'bg-primary font-semibold text-white' : 'text-on-dark'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <DemoLink className="text-on-dark hover:text-white">Ayuda</DemoLink>
        <DemoLink className="text-on-dark hover:text-white">Sucursales</DemoLink>
      </div>
    </div>
  )
}
