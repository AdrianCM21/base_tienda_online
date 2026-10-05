import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField'
import { Tabs } from '@/components/ui/Tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { useDemoNotice } from '@/hooks/useDemoNotice'
import { useVisitedPage } from '@/hooks/useVisitedPage'
import { getAllProducts, getFeatured } from '@/services/catalogService'
import type { Product } from '@/types/product'
import { AdminPageHeader } from './AdminPageHeader'

const MAX_FEATURED = 8
const DESTINATIONS = [
  { value: '/buscar?ofertas=1', label: 'Ofertas' },
  { value: '/buscar', label: 'Todo el catálogo' },
  { value: '/categoria/informatica', label: 'Una categoría (Computación)' },
]

function HeroTab() {
  const notice = useDemoNotice('Los cambios no se guardan: es una demostración')
  const [chip, setChip] = useState('Financiación propia')
  const [title, setTitle] = useState('Hasta 18 cuotas sin interés en toda la tienda')
  const [text, setText] = useState(
    'Comprá hoy y pagá cómodo con tu tarjeta de crédito. Válido en informática, electrónica y electrodomésticos.',
  )
  const [button, setButton] = useState('Ver ofertas')
  const [dest, setDest] = useState(DESTINATIONS[0].value)
  return (
    <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[minmax(0,380px)_1fr]">
      <div className="flex flex-col gap-4 rounded-card border border-light bg-white p-5">
        <TextField
          label="Etiqueta superior"
          value={chip}
          maxLength={30}
          onChange={(e) => setChip(e.target.value)}
        />
        <TextField
          label="Título"
          value={title}
          maxLength={70}
          onChange={(e) => setTitle(e.target.value)}
          hint={`${title.length}/70`}
        />
        <TextAreaField
          label="Texto"
          className=""
          rows={4}
          value={text}
          maxLength={160}
          onChange={(e) => setText(e.target.value)}
          hint={`${text.length}/160`}
        />
        <TextField
          label="Texto del botón"
          value={button}
          maxLength={20}
          onChange={(e) => setButton(e.target.value)}
        />
        <SelectField
          label="El botón lleva a"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
        >
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </SelectField>
        <Button onClick={notice}>Guardar banner</Button>
      </div>

      <section aria-label="Vista previa del banner principal" className="min-w-0">
        <p className="mt-0 mb-2 text-xs font-semibold text-muted">Vista previa de la portada</p>
        <div className="overflow-hidden rounded-card bg-[linear-gradient(135deg,var(--color-dark),var(--color-primary))] px-8 py-10">
          <span className="mb-4 inline-block rounded-pill bg-white/15 px-3.5 py-[5px] text-[12.5px] font-semibold text-white">
            {chip || 'Etiqueta'}
          </span>
          <p className="m-0 mb-3 max-w-[520px] font-heading text-[30px] leading-[1.15] font-bold text-white">
            {title || 'Título del banner'}
          </p>
          <p className="m-0 mb-6 max-w-[520px] text-[15px] leading-normal text-hero-text">
            {text || 'Texto de apoyo.'}
          </p>
          <span className="inline-block rounded-search bg-white px-6 py-3 text-[14px] font-bold text-dark">
            {button || 'Botón'}
          </span>
        </div>
      </section>
    </div>
  )
}

function FeaturedTab() {
  const { price } = useCurrency()
  const notice = useDemoNotice('Los cambios no se guardan: es una demostración')
  const addId = useId()
  const [featured, setFeatured] = useState<Product[]>(() => getFeatured(MAX_FEATURED))
  const [pick, setPick] = useState('')
  const available = useMemo(
    () => getAllProducts().filter((p) => !featured.some((f) => f.id === p.id)),
    [featured],
  )

  const move = (i: number, dir: -1 | 1) =>
    setFeatured((cur) => {
      const j = i + dir
      if (j < 0 || j >= cur.length) return cur
      const next = [...cur]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const add = () => {
    const p = available.find((x) => x.id === pick)
    if (p && featured.length < MAX_FEATURED) setFeatured((cur) => [...cur, p])
    setPick('')
  }

  return (
    <div className="grid grid-cols-1 gap-6 min-[1000px]:grid-cols-[minmax(0,460px)_1fr]">
      <section
        aria-labelledby="orden-titulo"
        className="min-w-0 rounded-card border border-light bg-white p-5"
      >
        <h2 id="orden-titulo" className="mb-1 font-sans text-[15px] font-bold">
          Productos destacados ({featured.length}/{MAX_FEATURED})
        </h2>
        <p className="mt-0 mb-4 text-[13px] text-muted">
          Aparecen en la Home en este orden. Subí o bajá cada producto, o sacalo de la lista.
        </p>
        <ol
          aria-label="Orden de los destacados"
          className="m-0 mb-4 list-none divide-y divide-light p-0"
        >
          {featured.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2 py-2.5 text-[13.5px]">
              <span className="w-5 text-center text-xs font-bold text-subtle">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="text-xs text-muted">{price(p.price)}</span>
              </span>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label={`Subir ${p.name}`}
                className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark disabled:opacity-30"
              >
                <ArrowUp size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={i === featured.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Bajar ${p.name}`}
                className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark disabled:opacity-30"
              >
                <ArrowDown size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setFeatured((cur) => cur.filter((x) => x.id !== p.id))}
                aria-label={`Quitar ${p.name} de los destacados`}
                className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        {featured.length === 0 && (
          <p className="mt-0 mb-4 text-[13px] text-muted">
            No hay destacados: la sección de la Home quedaría vacía.
          </p>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={addId} className="mb-1.5 block text-[12.5px] font-semibold text-muted">
              Agregar producto
            </label>
            <select
              id={addId}
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              disabled={featured.length >= MAX_FEATURED}
              className="w-full rounded-control border border-light bg-white px-3 py-[11px] text-sm"
            >
              <option value="">
                {featured.length >= MAX_FEATURED ? 'Llegaste al máximo' : 'Elegí un producto'}
              </option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={add} disabled={!pick}>
            <Plus size={16} aria-hidden="true" />
            Agregar
          </Button>
        </div>
        <Button className="mt-4" onClick={notice}>
          Guardar destacados
        </Button>
      </section>

      <section aria-label="Vista previa de los destacados" className="min-w-0">
        <p className="mt-0 mb-2 text-xs font-semibold text-muted">Vista previa de la Home</p>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 p-0">
          {featured.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-card border border-light bg-white">
              <div aria-hidden="true" className="h-20 bg-light" />
              <div className="p-2.5">
                <p className="m-0 line-clamp-2 min-h-8 text-[12px] leading-tight font-semibold">
                  {p.name}
                </p>
                <p className="m-0 mt-1 text-[13px] font-bold text-primary">{price(p.price)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default function BannersPage() {
  useVisitedPage('banners')
  return (
    <>
      <AdminPageHeader
        title="Banners y destacados"
        description="La portada de la Home y los productos que se muestran primero. Se editan en pantalla; en la demo no se guardan."
      />
      <Tabs
        tabs={[
          { id: 'hero', label: 'Banner principal', content: <HeroTab /> },
          { id: 'destacados', label: 'Productos destacados', content: <FeaturedTab /> },
        ]}
      />
    </>
  )
}
