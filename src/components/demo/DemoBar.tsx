import { MonitorPlay, RotateCcw, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { demoScreens, type DemoScreen } from '@/config/demoScreens'
import { paths } from '@/config/routes'
import { themes } from '@/config/themes'
import { useCart } from '@/hooks/useCart'
import { useDemoBar } from '@/hooks/useDemoBar'
import { useTheme } from '@/hooks/useTheme'
import { getProductById } from '@/services/catalogService'
import { ensureSampleOrder, resetDemoStorage, sampleCartItems } from '@/services/demoService'
import { hardNavigate } from '@/utils/navigation'
import { ConfirmDialog } from '../ui/ConfirmDialog'

const item = 'shrink-0 rounded-control px-2.5 py-1 whitespace-nowrap transition-colors'
const itemOff = 'text-neutral-300 hover:bg-white/10 hover:text-white'
const itemOn = 'bg-white font-semibold text-neutral-900 hover:text-neutral-900'

/**
 * Barra superior para saltar entre pantallas durante una presentación.
 * Las pantallas que necesitan datos (carrito, checkout, confirmación) se preparan solas.
 */
export function DemoBar() {
  const { enabled, visible, hide, show } = useDemoBar()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { lines, add } = useCart()
  const { theme, setTheme } = useTheme()
  const [confirmReset, setConfirmReset] = useState(false)
  const cancelReset = useCallback(() => setConfirmReset(false), [])
  const navRef = useRef<HTMLElement>(null)

  // En pantallas angostas la lista se desplaza: se centra la pantalla actual (sin mover la página).
  // Se repite al cargar las fuentes, porque cambian el ancho de los botones.
  useEffect(() => {
    const center = () => {
      const nav = navRef.current
      const active = nav?.querySelector<HTMLElement>('[aria-current]')
      if (!nav || !active) return
      const itemLeft =
        active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft
      nav.scrollLeft = itemLeft - (nav.clientWidth - active.offsetWidth) / 2
    }
    center()
    void document.fonts?.ready.then(center)
  }, [pathname, visible])

  if (!enabled) return null

  if (!visible) {
    return (
      <button
        type="button"
        onClick={show}
        aria-label="Mostrar barra de demo"
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-pill bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-card-hover hover:bg-neutral-800"
      >
        <MonitorPlay size={14} aria-hidden="true" />
        Demo
      </button>
    )
  }

  const go = (screen: DemoScreen) => {
    if (screen.prepare === 'cart' && lines.length === 0) {
      for (const i of sampleCartItems()) {
        const product = getProductById(i.productId)
        if (product) add(product, { colorName: i.colorName, quantity: i.quantity })
      }
    }
    navigate(screen.prepare === 'order' ? paths.order(ensureSampleOrder().id) : screen.to)
  }

  const reset = () => {
    resetDemoStorage()
    hardNavigate(paths.home)
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex h-10 items-center gap-3 bg-neutral-900 px-4 text-[12.5px] text-neutral-200">
        <span className="shrink-0 rounded-[4px] bg-amber-400 px-1.5 py-0.5 text-[10.5px] font-bold tracking-wide text-neutral-900">
          DEMO
        </span>

        <nav
          ref={navRef}
          aria-label="Navegación de la demo"
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]"
        >
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            {demoScreens.map((s) => {
              const active = s.isActive(pathname)
              const cls = `${item} ${active ? itemOn : itemOff}`
              return (
                <li key={s.id}>
                  {s.prepare ? (
                    <button
                      type="button"
                      onClick={() => go(s)}
                      aria-current={active ? 'page' : undefined}
                      className={cls}
                    >
                      {s.label}
                    </button>
                  ) : (
                    <Link to={s.to} aria-current={active ? 'page' : undefined} className={cls}>
                      {s.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div
          role="radiogroup"
          aria-label="Paleta de colores"
          className="hidden shrink-0 items-center md:flex"
        >
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme.id === t.id}
              aria-label={`Paleta ${t.label}`}
              title={t.label}
              onClick={() => setTheme(t.id)}
              className="flex h-6 w-6 items-center justify-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={`block h-4 w-4 rounded-full border border-white/30 ${theme.id === t.id ? 'shadow-[0_0_0_2px_#171717,0_0_0_3.5px_#fff]' : ''}`}
                style={{ background: t.colors.primary }}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className={`${item} ${itemOff} inline-flex items-center gap-1.5`}
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Reiniciar demo</span>
          <span className="sr-only sm:hidden">Reiniciar demo</span>
        </button>
        <button
          type="button"
          onClick={hide}
          aria-label="Ocultar barra de demo"
          className="shrink-0 rounded-control p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="¿Reiniciar la demo?"
        confirmLabel="Reiniciar"
        onConfirm={reset}
        onCancel={cancelReset}
      >
        Se vaciará el carrito y se borrarán los pedidos, la moneda y la paleta elegidos en este
        navegador.
      </ConfirmDialog>
    </>
  )
}
