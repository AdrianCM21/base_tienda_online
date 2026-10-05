import { useState } from 'react'
import { TextField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { brand } from '@/config/brand'
import { Section, SettingsForm } from './SettingsSection'

type Hours = { id: string; label: string; open: boolean; from: string; to: string }
const DAYS: Hours[] = [
  { id: 'lv', label: 'Lunes a viernes', open: true, from: '08:00', to: '19:00' },
  { id: 'sa', label: 'Sábados', open: true, from: '08:00', to: '13:00' },
  { id: 'do', label: 'Domingos y feriados', open: false, from: '09:00', to: '12:00' },
]

export function GeneralTab() {
  const [hours, setHours] = useState<Hours[]>(DAYS)
  const set = (id: string, patch: Partial<Hours>) =>
    setHours((cur) => cur.map((h) => (h.id === id ? { ...h, ...patch } : h)))
  return (
    <SettingsForm>
      <Section title="Datos de la tienda">
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <TextField label="Nombre comercial" defaultValue={brand.name} />
          <TextField label="Razón social" defaultValue={brand.legalName} />
          <TextField label="Email de contacto" type="email" defaultValue={brand.contact.email} />
          <TextField label="Teléfono" type="tel" defaultValue={brand.contact.phone} />
          <TextField
            label="WhatsApp (con código de país)"
            inputMode="tel"
            defaultValue={`+${brand.whatsapp}`}
            hint="A este número llegan las consultas de los clientes."
          />
          <TextField label="Dirección" defaultValue={brand.contact.address} />
        </div>
      </Section>

      <Section title="Horarios de atención" hint="Se muestran en la tienda y en el pie de página.">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {hours.map((h) => (
            <li
              key={h.id}
              className="grid grid-cols-1 items-end gap-3 min-[700px]:grid-cols-[200px_auto_auto_1fr]"
            >
              <Switch checked={h.open} onChange={(v) => set(h.id, { open: v })} label={h.label} />
              <TextField
                label="Abre"
                type="time"
                value={h.from}
                disabled={!h.open}
                onChange={(e) => set(h.id, { from: e.target.value })}
              />
              <TextField
                label="Cierra"
                type="time"
                value={h.to}
                disabled={!h.open}
                onChange={(e) => set(h.id, { to: e.target.value })}
              />
              <span className="pb-2.5 text-[12.5px] text-muted">
                {h.open ? `Abierto de ${h.from} a ${h.to}` : 'Cerrado'}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Redes sociales">
        <div className="grid gap-4 min-[700px]:grid-cols-3">
          <TextField label="Facebook" placeholder="@tutienda" />
          <TextField label="Instagram" placeholder="@tutienda" />
          <TextField label="YouTube" placeholder="@tutienda" />
        </div>
      </Section>
    </SettingsForm>
  )
}
