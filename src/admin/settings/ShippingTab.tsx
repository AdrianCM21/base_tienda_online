import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { brand } from '@/config/brand'
import { getBranches } from '@/services/storeService'
import { Section, SettingsForm } from './SettingsSection'

type Zone = { id: string; name: string; cost: string; eta: string; active: boolean }
const digits = (s: string) => s.replace(/\D/g, '')
const cell = 'w-full rounded-control border border-light bg-white px-2.5 py-2 text-[13px]'

export function ShippingTab() {
  const [zones, setZones] = useState<Zone[]>([
    {
      id: 'z1',
      name: 'Asunción y Gran Asunción',
      cost: String(brand.shippingFee),
      eta: '24 a 48 hs',
      active: true,
    },
    { id: 'z2', name: 'Interior del país', cost: '45000', eta: '3 a 5 días hábiles', active: true },
    { id: 'z3', name: 'Zonas remotas', cost: '80000', eta: '5 a 8 días hábiles', active: false },
  ])
  const [pickup, setPickup] = useState(true)
  const set = (id: string, patch: Partial<Zone>) =>
    setZones((cur) => cur.map((z) => (z.id === id ? { ...z, ...patch } : z)))

  return (
    <SettingsForm>
      <Section
        title="Zonas y tarifas de envío"
        hint="El costo se muestra en el checkout según la zona del cliente."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[13px]">
            <caption className="sr-only">Zonas de envío</caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                {['Zona', 'Costo (Gs.)', 'Plazo estimado', 'Activa', ''].map((h, i) => (
                  <th key={i} scope="col" className="px-2 py-2 font-semibold">
                    {h || <span className="sr-only">Acciones</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-t border-light">
                  <td className="px-2 py-2">
                    <input
                      aria-label="Nombre de la zona"
                      className={cell}
                      value={z.name}
                      onChange={(e) => set(z.id, { name: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      aria-label={`Costo de ${z.name || 'la zona'}`}
                      inputMode="numeric"
                      className={`${cell} w-32`}
                      value={z.cost}
                      onChange={(e) => set(z.id, { cost: digits(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      aria-label={`Plazo de ${z.name || 'la zona'}`}
                      className={cell}
                      value={z.eta}
                      onChange={(e) => set(z.id, { eta: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Zona ${z.name || ''} activa`}
                      className="h-4 w-4 accent-primary"
                      checked={z.active}
                      onChange={(e) => set(z.id, { active: e.target.checked })}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      aria-label={`Quitar ${z.name || 'la zona'}`}
                      onClick={() => setZones((cur) => cur.filter((x) => x.id !== z.id))}
                      className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() =>
            setZones((cur) => [
              ...cur,
              {
                id: `z${cur.length + 1}-${Date.now()}`,
                name: '',
                cost: '0',
                eta: '',
                active: true,
              },
            ])
          }
        >
          <Plus size={16} aria-hidden="true" />
          Agregar zona
        </Button>
      </Section>

      <Section title="Envío gratis">
        <div className="max-w-[360px]">
          <TextField
            label="Envío gratis en compras desde (Gs.)"
            inputMode="numeric"
            defaultValue={String(brand.freeShippingThreshold)}
            hint="Dejalo en 0 para no ofrecer envío gratis."
          />
        </div>
      </Section>

      <Section title="Retiro en sucursal">
        <Switch
          checked={pickup}
          onChange={setPickup}
          label="Permitir retiro en sucursal"
          description="Sin costo para el cliente."
        />
        {pickup && (
          <ul className="m-0 mt-2 list-none divide-y divide-light p-0">
            {getBranches().map((b) => (
              <li key={b.id} className="flex items-start gap-3 py-2.5 text-[13.5px]">
                <input
                  type="checkbox"
                  id={`suc-${b.id}`}
                  defaultChecked
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <label htmlFor={`suc-${b.id}`} className="cursor-pointer">
                  <span className="block font-semibold">{b.name}</span>
                  <span className="block text-xs text-muted">
                    {b.address} · {b.hours}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </SettingsForm>
  )
}
