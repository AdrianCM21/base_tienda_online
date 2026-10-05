import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { brand } from '@/config/brand'
import { themes } from '@/config/themes'
import { useTheme } from '@/hooks/useTheme'
import { AdminPageHeader } from './AdminPageHeader'

export default function AppearancePage() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState<string>(brand.logoText)
  const nameId = useId()

  return (
    <>
      <AdminPageHeader
        title="Apariencia"
        description="Elegí la paleta de la tienda y mirá cómo queda el nombre de la marca."
      />

      <section
        aria-labelledby="paleta-titulo"
        className="mb-6 rounded-card border border-light bg-white p-5"
      >
        <h2 id="paleta-titulo" className="mb-1 font-sans text-[15px] font-bold">
          Paleta de colores
        </h2>
        <p className="mt-0 mb-4 text-[13px] text-muted">
          Se aplica al instante en toda la tienda (se guarda en este navegador).
        </p>
        <div
          role="radiogroup"
          aria-label="Paleta de colores"
          className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3"
        >
          {themes.map((t) => {
            const selected = t.id === theme.id
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(t.id)}
                className={`relative rounded-card border-2 p-3 text-left ${selected ? 'border-primary bg-light' : 'border-light bg-white hover:border-subtle'}`}
              >
                <span className="mb-2 flex overflow-hidden rounded-control">
                  {([t.colors.dark, t.colors.primary, t.colors.light, t.colors.bg] as string[]).map(
                    (c, i) => (
                      <span key={i} className="h-8 flex-1" style={{ background: c }} />
                    ),
                  )}
                </span>
                <span className="text-[13.5px] font-semibold">{t.label}</span>
                {selected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section
        aria-labelledby="marca-titulo"
        className="rounded-card border border-light bg-white p-5"
      >
        <h2 id="marca-titulo" className="mb-1 font-sans text-[15px] font-bold">
          Nombre de la marca
        </h2>
        <p className="mt-0 mb-4 text-[13px] text-muted">
          Vista previa solamente. Para cambiarlo de verdad se edita <code>src/config/brand.ts</code>{' '}
          y se actualiza toda la tienda.
        </p>
        <label htmlFor={nameId} className="mb-1.5 block text-[12.5px] font-semibold text-muted">
          Nombre en el logo
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={28}
          className="mb-4 w-full max-w-[360px] rounded-control border border-light px-3 py-[11px] text-sm"
        />
        <div
          aria-label="Vista previa"
          role="group"
          className="overflow-hidden rounded-card border border-light"
        >
          <div className="flex items-center justify-between bg-dark px-5 py-4">
            <span className="font-heading text-[22px] font-bold tracking-[0.5px] text-white">
              {name || brand.logoText}
            </span>
            <span className="rounded-control bg-primary px-3 py-1.5 text-xs font-bold text-white">
              Comprar
            </span>
          </div>
          <div className="bg-bg p-5">
            <span className="text-[19px] font-bold text-primary">Gs. 4.590.000</span>
            <p className="mt-1 mb-0 text-xs text-muted">
              {name || brand.logoText} · financiación en hasta 18 cuotas
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
