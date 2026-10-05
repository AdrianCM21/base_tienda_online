import { useId } from 'react'

import { PERIODS, type Period } from './periods'

type Props = { value: Period; onChange: (p: Period) => void }

/** Selector de período (últimos 7, 14 o 30 días). */
export function PeriodSelect({ value, onChange }: Props) {
  const name = useId()
  return (
    <div
      role="radiogroup"
      aria-label="Período"
      className="inline-flex rounded-control border border-light bg-white p-0.5"
    >
      {PERIODS.map((p) => (
        <label
          key={p}
          className={`cursor-pointer rounded-[5px] px-3 py-1.5 text-[12.5px] font-semibold focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary ${value === p ? 'bg-primary text-white' : 'text-muted hover:bg-light hover:text-dark'}`}
        >
          <input
            type="radio"
            name={name}
            className="sr-only"
            checked={value === p}
            onChange={() => onChange(p)}
          />
          {p} días
        </label>
      ))}
    </div>
  )
}
