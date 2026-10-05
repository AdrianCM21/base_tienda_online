import { useState } from 'react'
import { SelectField, TextField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { brand } from '@/config/brand'
import { useCurrency } from '@/hooks/useCurrency'
import { ivaIncluded, withIva } from '@/utils/tax'
import { Section, SettingsForm } from './SettingsSection'

const RATES = [
  { value: '10', label: 'IVA 10%' },
  { value: '5', label: 'IVA 5%' },
  { value: '0', label: 'Exento' },
]

export function TaxesTab() {
  const { price } = useCurrency()
  const [rate, setRate] = useState('10')
  const [included, setIncluded] = useState(true)
  const sample = 110_000
  const iva = ivaIncluded(sample, Number(rate))
  const net = sample - iva
  return (
    <SettingsForm>
      <Section title="IVA" hint="Cómo se calculan y se muestran los impuestos en tus precios.">
        <div className="max-w-[360px]">
          <SelectField label="Tasa general" value={rate} onChange={(e) => setRate(e.target.value)}>
            {RATES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </SelectField>
        </div>
        <Switch
          checked={included}
          onChange={setIncluded}
          label="Los precios ya incluyen IVA"
          description="Es lo habitual en tiendas para consumidor final."
        />
        <p
          aria-live="polite"
          className="mt-3 mb-0 rounded-control bg-light px-3.5 py-2.5 text-[13px]"
        >
          {included
            ? `Un producto de ${price(sample)} incluye ${price(iva)} de IVA (neto ${price(net)}).`
            : `Un producto de ${price(sample)} + IVA se cobra ${price(withIva(sample, Number(rate)))} al cliente.`}
        </p>
      </Section>

      <Section title="Datos fiscales" hint="Aparecen en las facturas y comprobantes.">
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <TextField label="RUC" defaultValue="80000000-0" />
          <TextField label="Razón social" defaultValue={brand.legalName} />
          <TextField label="Timbrado" placeholder="Número de timbrado" />
          <TextField label="Establecimiento" defaultValue="001-001" />
        </div>
        <div className="mt-3">
          <Switch
            checked={true}
            onChange={() => {}}
            label="Emitir factura electrónica"
            description="Ejemplo: en la demo no se emite ningún comprobante."
          />
        </div>
      </Section>
    </SettingsForm>
  )
}
