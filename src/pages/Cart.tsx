import { ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartLineRow } from '@/components/cart/CartLineRow'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { buttonClasses } from '@/components/ui/button-styles'
import { EmptyState } from '@/components/ui/EmptyState'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'
import { useCart } from '@/hooks/useCart'
import { useCurrency } from '@/hooks/useCurrency'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useNoIndex } from '@/hooks/useNoIndex'

export default function Cart() {
  useDocumentTitle('Carrito')
  useNoIndex()
  const { lines, count, subtotal, clear } = useCart()
  const { price } = useCurrency()
  const missing = Math.max(0, brand.freeShippingThreshold - subtotal)
  const progress = Math.min(100, (subtotal / brand.freeShippingThreshold) * 100)

  return (
    <>
      <Breadcrumb items={[{ label: 'Inicio', to: paths.home }, { label: 'Carrito' }]} />
      <div className="mx-auto max-w-[1100px] px-6 pt-4 pb-14">
        <h1 className="mb-5 text-[28px] font-bold">Carrito de compras</h1>
        {lines.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={26} aria-hidden="true" />}
            title="Tu carrito está vacío"
            action={
              <Link to={paths.search()} className={buttonClasses('primary')}>
                Explorar productos
              </Link>
            }
          >
            Cuando agregues productos los vas a ver acá, listos para comprar.
          </EmptyState>
        ) : (
          <div className="grid items-start gap-7 min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
            <section
              aria-label="Productos en el carrito"
              className="rounded-card border border-light bg-white px-5 py-1"
            >
              <ul className="m-0 list-none divide-y divide-light p-0">
                {lines.map((l) => (
                  <CartLineRow key={l.key} line={l} />
                ))}
              </ul>
              <div className="border-t border-light py-3.5">
                <button
                  type="button"
                  onClick={clear}
                  className="text-[13px] font-semibold text-muted hover:text-red-700"
                >
                  Vaciar carrito
                </button>
              </div>
            </section>

            <aside
              aria-label="Resumen"
              className="rounded-card border border-light bg-white p-[22px] min-[900px]:sticky min-[900px]:top-[calc(var(--demo-bar-h,0px)+24px)]"
            >
              <h2 className="mb-4 font-sans text-[15px] font-bold">Resumen</h2>
              <div className="mb-3.5 flex items-start gap-2.5 rounded-card bg-light px-3.5 py-3 text-[12.5px] text-dark">
                <Truck size={18} strokeWidth={1.6} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  {missing === 0 ? (
                    <strong>¡Tenés envío gratis!</strong>
                  ) : (
                    <>
                      Te faltan <strong>{price(missing)}</strong> para el envío gratis
                    </>
                  )}
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-t border-light pt-3.5 text-[13.5px] text-muted">
                <span>
                  Subtotal ({count} {count === 1 ? 'producto' : 'productos'})
                </span>
                <span>{price(subtotal)}</span>
              </div>
              <p className="mt-1.5 mb-4 text-xs text-subtle">
                El costo de envío se calcula en el checkout.
              </p>
              <div className="mb-4 flex items-baseline justify-between border-t border-light pt-3">
                <span className="text-[15px] font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">{price(subtotal)}</span>
              </div>
              <Link
                to={paths.checkout}
                className={`${buttonClasses('primary', 'md', true)} py-3.5 text-[14.5px]`}
              >
                Continuar con la compra
              </Link>
              <Link
                to={paths.search()}
                className="mt-3 block text-center text-[13px] font-semibold"
              >
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
