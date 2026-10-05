import { useId } from 'react'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

/** Interruptor accesible (role="switch") con etiqueta y descripción opcional. */
export function Switch({ checked, onChange, label, description }: Props) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <label htmlFor={id} className="cursor-pointer text-[13.5px] font-semibold">
          {label}
        </label>
        {description && <p className="m-0 mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-neutral-300'}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}
