import { Check } from 'lucide-react'

type Props = { step: 1 | 2 }

/** Indicador de 2 pasos: el 1 muestra check cuando ya se completó. */
export function Stepper({ step }: Props) {
  const done1 = step > 1
  return (
    <nav
      aria-label="Progreso de la compra"
      className="flex justify-center border-b border-light bg-white px-6 py-[22px]"
    >
      <ol className="m-0 flex w-full max-w-[420px] list-none items-center gap-3.5 p-0">
        <li
          className="flex flex-col items-center gap-1.5"
          aria-current={step === 1 ? 'step' : undefined}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {done1 ? <Check size={16} strokeWidth={2.4} aria-hidden="true" /> : 1}
          </span>
          <span
            className={`text-center text-xs ${done1 ? 'font-semibold text-primary' : 'font-bold text-dark'}`}
          >
            Datos de envío
          </span>
        </li>
        <li
          aria-hidden="true"
          className={`-mt-5 h-0.5 flex-1 ${done1 ? 'bg-primary' : 'bg-light'}`}
        />
        <li
          className="flex flex-col items-center gap-1.5"
          aria-current={step === 2 ? 'step' : undefined}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
          >
            2
          </span>
          <span
            className={`text-center text-xs ${step === 2 ? 'font-bold text-dark' : 'font-semibold text-muted'}`}
          >
            Forma de pago
          </span>
        </li>
      </ol>
    </nav>
  )
}
