import { Check, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminPaths, paths } from '@/config/routes'
import { CHECKLIST_HIDDEN_KEY, getVisited } from '@/utils/adminProgress'
import { readStorage, writeStorage } from '@/utils/storage'

type Props = { productCount: number; hasRealOrder: boolean }

/** Guía de inicio: pasos para dejar la tienda lista. Se marcan solos al pasar por cada pantalla. */
export function SetupChecklist({ productCount, hasRealOrder }: Props) {
  const [hidden, setHidden] = useState(
    () => readStorage<boolean>(CHECKLIST_HIDDEN_KEY, false) === true,
  )
  const visited = useMemo(() => getVisited(), [])

  const steps = [
    {
      id: 'productos',
      label: 'Cargá tus productos',
      hint: `${productCount} productos en el catálogo`,
      to: adminPaths.products,
      done: productCount > 0,
    },
    {
      id: 'apariencia',
      label: 'Elegí la paleta y la marca de tu tienda',
      hint: 'Colores, nombre y logo',
      to: adminPaths.appearance,
      done: visited.includes('apariencia'),
    },
    {
      id: 'configuracion',
      label: 'Revisá tus datos, envíos y medios de pago',
      hint: 'Configuración de la tienda',
      to: adminPaths.settings,
      done: visited.includes('configuracion'),
    },
    {
      id: 'cupones',
      label: 'Creá tu primer cupón de descuento',
      hint: 'Marketing › Cupones',
      to: adminPaths.coupons,
      done: visited.includes('cupones'),
    },
    {
      id: 'banners',
      label: 'Personalizá la portada y los destacados',
      hint: 'Marketing › Banners y destacados',
      to: adminPaths.banners,
      done: visited.includes('banners'),
    },
    {
      id: 'venta',
      label: 'Hacé una venta de prueba en tu tienda',
      hint: 'Recorré el checkout como un cliente',
      to: paths.home,
      done: hasRealOrder,
    },
  ]
  const completed = steps.filter((s) => s.done).length
  const pct = Math.round((completed / steps.length) * 100)

  if (hidden) return null
  const hide = () => {
    writeStorage(CHECKLIST_HIDDEN_KEY, true)
    setHidden(true)
  }

  return (
    <section
      aria-labelledby="checklist-titulo"
      className="mb-6 rounded-card border border-light bg-white p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 id="checklist-titulo" className="m-0 font-sans text-[15px] font-bold">
            {completed === steps.length ? '¡Tu tienda está lista!' : 'Configurá tu tienda'}
          </h2>
          <p className="mt-0.5 mb-0 text-[13px] text-muted">
            {completed} de {steps.length} pasos completados
          </p>
        </div>
        <button
          type="button"
          onClick={hide}
          aria-label="Ocultar la guía de inicio"
          className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso de la configuración"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mb-4 h-2 overflow-hidden rounded-full bg-light"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1 p-0 min-[900px]:grid-cols-2">
        {steps.map((s) => (
          <li key={s.id}>
            <Link
              to={s.to}
              className="flex items-center gap-3 rounded-control px-2 py-2 text-[13.5px] text-text hover:bg-bg hover:text-text"
            >
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${s.done ? 'border-primary bg-primary text-white' : 'border-subtle text-transparent'}`}
              >
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span className={`block font-semibold ${s.done ? 'text-muted line-through' : ''}`}>
                  {s.label}
                </span>
                <span className="block text-xs text-subtle">{s.hint}</span>
              </span>
              <span className="sr-only">{s.done ? '(completado)' : '(pendiente)'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
