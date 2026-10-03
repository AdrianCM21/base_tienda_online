import { Minus, Plus } from 'lucide-react'

type Props = {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label = 'Cantidad',
  disabled,
  size = 'md',
}: Props) {
  const btn = `flex ${size === 'sm' ? 'h-8 w-8' : 'h-11 w-9'} items-center justify-center bg-white text-dark hover:bg-light disabled:text-subtle disabled:hover:bg-white`
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center overflow-hidden rounded-control border-[1.5px] border-light"
    >
      <button
        type="button"
        aria-label="Disminuir cantidad"
        className={btn}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className={`${size === 'sm' ? 'w-8 text-[13px]' : 'w-10'} text-center font-semibold`}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        className={btn}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
