import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/FormField'
import { brand } from '@/config/brand'
import { useDemoNotice } from '@/hooks/useDemoNotice'
import { AdminPageHeader } from './AdminPageHeader'

const METHODS = ['Tarjeta de crédito/débito', 'Transferencia bancaria', 'Efectivo en sucursal']

/** Formularios de muestra: se pueden editar, pero "Guardar" solo avisa que es una demo. */
export default function SettingsPage() {
  const notice = useDemoNotice('Los cambios no se guardan: es una demostración')
  const [methods, setMethods] = useState<string[]>(METHODS)

  return (
    <>
      <AdminPageHeader
        title="Configuración"
        description="Datos de la tienda, envíos y medios de pago."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          notice()
        }}
        className="flex flex-col gap-6"
      >
        <fieldset className="m-0 rounded-card border border-light bg-white p-5">
          <legend className="float-left mb-3 w-full p-0 font-sans text-[15px] font-bold">
            Datos de la tienda
          </legend>
          <div className="clear-both grid gap-3.5 min-[700px]:grid-cols-2">
            <TextField label="Nombre comercial" defaultValue={brand.name} />
            <TextField label="Razón social" defaultValue={brand.legalName} />
            <TextField label="Email de contacto" type="email" defaultValue={brand.contact.email} />
            <TextField label="Teléfono" type="tel" defaultValue={brand.contact.phone} />
            <TextField
              className="min-[700px]:col-span-2"
              label="Dirección"
              defaultValue={brand.contact.address}
            />
          </div>
        </fieldset>

        <fieldset className="m-0 rounded-card border border-light bg-white p-5">
          <legend className="float-left mb-3 w-full p-0 font-sans text-[15px] font-bold">
            Envíos
          </legend>
          <div className="clear-both grid gap-3.5 min-[700px]:grid-cols-2">
            <TextField
              label="Envío gratis desde (Gs.)"
              inputMode="numeric"
              defaultValue={String(brand.freeShippingThreshold)}
            />
            <TextField
              label="Costo de envío estándar (Gs.)"
              inputMode="numeric"
              defaultValue={String(brand.shippingFee)}
            />
          </div>
        </fieldset>

        <fieldset className="m-0 rounded-card border border-light bg-white p-5">
          <legend className="float-left mb-3 w-full p-0 font-sans text-[15px] font-bold">
            Medios de pago
          </legend>
          <div className="clear-both flex flex-col gap-1">
            {METHODS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2.5 py-1 text-[13.5px]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={methods.includes(m)}
                  onChange={() =>
                    setMethods(
                      methods.includes(m) ? methods.filter((x) => x !== m) : [...methods, m],
                    )
                  }
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </>
  )
}
