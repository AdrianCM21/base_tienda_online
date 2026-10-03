import type { FormEvent } from 'react'
import { getBranches, getDepartments } from '@/services/storeService'
import type { ShippingData } from '@/types/checkout'
import type { FieldErrors } from '@/utils/checkout'
import { Button } from '../ui/Button'
import { SelectField, TextField } from '../ui/FormField'

type Props = {
  value: ShippingData
  errors: FieldErrors<ShippingData>
  onChange: (value: ShippingData) => void
  onSubmit: () => void
}

const METHODS = [
  { value: 'domicilio', label: 'Envío a domicilio' },
  { value: 'retiro', label: 'Retiro en sucursal' },
] as const

export function ShippingForm({ value, errors, onChange, onSubmit }: Props) {
  const set = <K extends keyof ShippingData>(key: K, v: ShippingData[K]) =>
    onChange({ ...value, [key]: v })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }
  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-light bg-white p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
          1
        </span>
        <h2 className="m-0 font-sans text-[15px] font-bold">1. Datos de envío</h2>
      </div>

      <fieldset className="m-0 mb-5 flex min-w-0 flex-wrap gap-2.5 border-0 p-0">
        <legend className="sr-only">Método de entrega</legend>
        {METHODS.map((m) => {
          const selected = value.method === m.value
          return (
            <label
              key={m.value}
              className={`flex min-w-[150px] flex-1 cursor-pointer items-center gap-2 rounded-control border-[1.5px] px-3.5 py-3 text-[13.5px] font-semibold ${
                selected ? 'border-primary bg-light' : 'border-light text-muted'
              }`}
            >
              <input
                type="radio"
                name="metodo-entrega"
                className="accent-primary"
                checked={selected}
                onChange={() => set('method', m.value)}
              />
              {m.label}
            </label>
          )
        })}
      </fieldset>

      <div className="flex flex-col gap-3.5">
        <TextField
          label="Nombre y apellido"
          autoComplete="name"
          value={value.fullName}
          error={errors.fullName}
          onChange={(e) => set('fullName', e.target.value)}
        />
        <TextField
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="0981 234 567"
          value={value.phone}
          error={errors.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        {value.method === 'retiro' ? (
          <SelectField
            label="Sucursal de retiro"
            value={value.branchId}
            error={errors.branchId}
            onChange={(e) => set('branchId', e.target.value)}
          >
            <option value="">Elegí una sucursal</option>
            {getBranches().map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.address}
              </option>
            ))}
          </SelectField>
        ) : (
          <>
            <TextField
              label="Dirección"
              autoComplete="street-address"
              placeholder="Calle y número"
              value={value.address}
              error={errors.address}
              onChange={(e) => set('address', e.target.value)}
            />
            <div className="grid gap-3.5 min-[520px]:grid-cols-2">
              <TextField
                label="Ciudad"
                autoComplete="address-level2"
                value={value.city}
                error={errors.city}
                onChange={(e) => set('city', e.target.value)}
              />
              <SelectField
                label="Departamento"
                autoComplete="address-level1"
                value={value.department}
                error={errors.department}
                onChange={(e) => set('department', e.target.value)}
              >
                <option value="">Elegí un departamento</option>
                {getDepartments().map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextField
              label="Código postal"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={4}
              placeholder="1209"
              className="min-[520px]:w-1/2"
              value={value.postalCode}
              error={errors.postalCode}
              onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, ''))}
            />
          </>
        )}
      </div>

      <Button type="submit" size="md" className="mt-6 w-full py-3">
        Continuar al pago
      </Button>
    </form>
  )
}
