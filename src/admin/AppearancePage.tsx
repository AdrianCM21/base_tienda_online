import { Check, ImagePlus, Search, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { brand } from '@/config/brand'
import { themes } from '@/config/themes'
import { useTheme } from '@/hooks/useTheme'
import { useVisitedPage } from '@/hooks/useVisitedPage'
import { describeContrast } from '@/utils/color'
import { AdminPageHeader } from './AdminPageHeader'

export default function AppearancePage() {
  useVisitedPage('apariencia')
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState<string>(brand.logoText)
  const [custom, setCustom] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const nameId = useId()
  const colorId = useId()
  const logoId = useId()

  // La vista previa del logo usa una URL local que se libera al reemplazarla o salir.
  useEffect(() => () => void (logo && URL.revokeObjectURL(logo)), [logo])

  const shownName = name || brand.logoText
  const color = custom ?? theme.colors.primary
  const message = describeContrast(color)

  return (
    <>
      <AdminPageHeader
        title="Apariencia"
        description="Elegí la paleta de la tienda y probá tu marca (nombre, logo y color) en la vista previa."
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
                onClick={() => {
                  setTheme(t.id)
                  setCustom(null)
                }}
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
        className="mb-6 rounded-card border border-light bg-white p-5"
      >
        <h2 id="marca-titulo" className="mb-1 font-sans text-[15px] font-bold">
          Tu marca
        </h2>
        <p className="mt-0 mb-4 text-[13px] text-muted">
          Solo vista previa: no se guarda. Para cambiarlo de verdad se edita{' '}
          <code>src/config/brand.ts</code> y se actualiza toda la tienda.
        </p>
        <div className="grid gap-5 min-[900px]:grid-cols-3">
          <div>
            <label htmlFor={nameId} className="mb-1.5 block text-[12.5px] font-semibold text-muted">
              Nombre en el logo
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={28}
              className="w-full rounded-control border border-light px-3 py-[11px] text-sm"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[12.5px] font-semibold text-muted">
              Logo (opcional)
            </span>
            <div className="flex items-center gap-2">
              <label
                htmlFor={logoId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-control border-[1.5px] border-dark px-3 py-[9px] text-[13px] font-semibold text-dark hover:bg-dark hover:text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
              >
                <ImagePlus size={15} aria-hidden="true" />
                Subir logo
                <input
                  id={logoId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setLogo(URL.createObjectURL(f))
                  }}
                />
              </label>
              {logo && (
                <Button variant="ghost" size="sm" onClick={() => setLogo(null)}>
                  <Trash2 size={15} aria-hidden="true" />
                  Quitar logo
                </Button>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor={colorId}
              className="mb-1.5 block text-[12.5px] font-semibold text-muted"
            >
              Color principal propio
            </label>
            <div className="flex items-center gap-2">
              <input
                id={colorId}
                type="color"
                value={color}
                onChange={(e) => setCustom(e.target.value.toUpperCase())}
                className="h-10 w-14 cursor-pointer rounded-control border border-light bg-white p-0.5"
              />
              <span className="font-mono text-[13px]">{color.toUpperCase()}</span>
              {custom && (
                <Button variant="ghost" size="sm" onClick={() => setCustom(null)}>
                  Restablecer
                </Button>
              )}
            </div>
            <p
              role="status"
              className={`mt-2 mb-0 text-xs font-semibold ${message.ok ? 'text-emerald-800' : 'text-red-700'}`}
            >
              {message.text}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="preview-titulo">
        <h2 id="preview-titulo" className="mb-2 font-sans text-[15px] font-bold">
          Vista previa de la tienda
        </h2>
        <div
          role="group"
          aria-label="Vista previa"
          style={custom ? ({ '--color-primary': custom } as React.CSSProperties) : undefined}
          className="overflow-hidden rounded-card border border-light bg-bg"
        >
          <div className="flex items-center gap-4 bg-dark px-5 py-3.5">
            {logo ? (
              <img
                src={logo}
                alt={`Logo de ${shownName}`}
                className="h-8 max-w-[140px] object-contain"
              />
            ) : (
              <span className="font-heading text-[22px] font-bold tracking-[0.5px] text-white">
                {shownName}
              </span>
            )}
            <span className="hidden max-w-[320px] flex-1 items-center justify-between overflow-hidden rounded-search bg-white sm:flex">
              <span className="px-3 py-2 text-[12.5px] text-subtle">
                Buscar productos, marcas y más…
              </span>
              <span className="flex h-full items-center bg-primary px-3.5 py-2 text-white">
                <Search size={15} aria-hidden="true" />
              </span>
            </span>
            <span className="ml-auto text-white">
              <ShoppingBag size={22} aria-hidden="true" />
            </span>
          </div>
          <div className="bg-[linear-gradient(135deg,var(--color-dark),var(--color-primary))] px-6 py-7">
            <span className="mb-2 inline-block rounded-pill bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              Financiación propia
            </span>
            <p className="m-0 mb-3 font-heading text-[22px] leading-tight font-bold text-white">
              Hasta 18 cuotas sin interés en toda la tienda
            </p>
            <span className="inline-block rounded-search bg-white px-4 py-2 text-[13px] font-bold text-dark">
              Ver ofertas
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 p-5">
            <div className="w-[190px] overflow-hidden rounded-card border border-light bg-white">
              <div aria-hidden="true" className="h-24 bg-light" />
              <div className="flex flex-col gap-1.5 p-3">
                <span className="text-[13px] font-semibold">Producto de ejemplo</span>
                <span className="text-[18px] font-bold text-primary">Gs. 4.590.000</span>
                <span className="text-xs text-muted">12 cuotas de Gs. 382.500</span>
                <span className="rounded-control border-[1.5px] border-dark py-1.5 text-center text-[12.5px] font-semibold text-dark">
                  Agregar al carrito
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="inline-block w-fit rounded-control bg-primary px-4 py-2 text-[13px] font-bold text-white">
                Comprar ahora
              </span>
              <span className="text-[13px] font-semibold text-primary">Ver todos →</span>
              <span className="w-fit rounded-[4px] bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                OFERTA
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
