import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

const control =
  'w-full rounded-control border bg-white px-3 py-[11px] text-sm text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary placeholder:text-subtle'

type Common = { label: string; error?: string; hint?: ReactNode; className?: string }

function Wrapper({
  id,
  label,
  error,
  hint,
  className = '',
  children,
}: Common & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 mb-0 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 mb-0 text-xs text-subtle">{hint}</p>
      )}
    </div>
  )
}

export function TextField({
  label,
  error,
  hint,
  className,
  ...input
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} ${error ? 'border-red-600' : 'border-light'}`}
        {...input}
      />
    </Wrapper>
  )
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} ${error ? 'border-red-600' : 'border-light'}`}
        {...select}
      >
        {children}
      </select>
    </Wrapper>
  )
}
