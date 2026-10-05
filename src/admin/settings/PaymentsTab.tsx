import { useState } from 'react'
import { SelectField, TextField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { getBranches } from '@/services/storeService'
import { Section, SettingsForm } from './SettingsSection'

export function PaymentsTab() {
  const [card, setCard] = useState(true)
  const [transfer, setTransfer] = useState(true)
  const [cash, setCash] = useState(true)
  return (
    <SettingsForm>
      <Section
        title="Tarjeta de crédito y débito"
        hint="Cobro online con tu procesadora de pagos (en la demo no se cobra nada)."
      >
        <Switch checked={card} onChange={setCard} label="Aceptar tarjetas" />
        {card && (
          <div className="mt-3 grid gap-4 min-[700px]:grid-cols-2">
            <SelectField label="Máximo de cuotas" defaultValue="18">
              {[1, 3, 6, 10, 12, 18].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? 'Sin cuotas' : `${n} cuotas`}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Cuotas sin interés hasta"
              defaultValue="12"
              hint="Más allá de este número se aplica el interés de la procesadora."
            >
              {[1, 3, 6, 10, 12, 18].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? 'Ninguna' : `${n} cuotas`}
                </option>
              ))}
            </SelectField>
            <TextField label="Procesadora de pagos" defaultValue="Procesadora de ejemplo" />
            <TextField
              label="Clave pública"
              defaultValue="pk_demo_xxxxxxxx"
              hint="Dato de ejemplo."
            />
          </div>
        )}
      </Section>

      <Section title="Transferencia bancaria">
        <Switch
          checked={transfer}
          onChange={setTransfer}
          label="Aceptar transferencias"
          description="El cliente ve estos datos al confirmar el pedido."
        />
        {transfer && (
          <div className="mt-3 grid gap-4 min-[700px]:grid-cols-2">
            <TextField label="Banco" defaultValue="Banco Meridiano" />
            <TextField label="Titular" defaultValue="Tienda Demo S.A." />
            <TextField label="Cuenta corriente" defaultValue="00-1234567-8" />
            <TextField label="RUC" defaultValue="80000000-0" />
          </div>
        )}
      </Section>

      <Section title="Efectivo en sucursal">
        <Switch checked={cash} onChange={setCash} label="Aceptar pago en efectivo al retirar" />
        {cash && (
          <ul className="m-0 mt-2 list-none divide-y divide-light p-0">
            {getBranches().map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-2.5 text-[13.5px]">
                <input
                  type="checkbox"
                  id={`pago-${b.id}`}
                  defaultChecked
                  className="h-4 w-4 accent-primary"
                />
                <label htmlFor={`pago-${b.id}`} className="cursor-pointer font-semibold">
                  {b.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </SettingsForm>
  )
}
