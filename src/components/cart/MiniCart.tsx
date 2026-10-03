import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paths } from '@/config/routes'
import { useCart } from '@/hooks/useCart'
import { useCurrency } from '@/hooks/useCurrency'
import { buttonClasses } from '../ui/button-styles'
import { Drawer } from '../ui/Drawer'
import { CartLineRow } from './CartLineRow'

type Props = { open: boolean; onClose: () => void }

/** Carrito lateral que se abre desde el header. */
export function MiniCart({ open, onClose }: Props) {
  const { lines, count, subtotal } = useCart()
  const { price } = useCurrency()
  return (
    <Drawer open={open} onClose={onClose} side="right" title={`Tu carrito (${count})`}>
      {lines.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light text-primary">
            <ShoppingBag size={26} aria-hidden="true" />
          </div>
          <p className="m-0 mb-1 font-bold">Tu carrito está vacío</p>
          <p className="m-0 mb-5 text-[13.5px] text-muted">Agregá productos para verlos acá.</p>
          <Link to={paths.search()} onClick={onClose} className={buttonClasses('primary')}>
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="m-0 flex-1 list-none divide-y divide-light overflow-y-auto px-5 py-0">
            {lines.map((l) => (
              <CartLineRow key={l.key} line={l} compact onNavigate={onClose} />
            ))}
          </ul>
          <div className="border-t border-light bg-white px-5 py-4">
            <div className="mb-3.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-muted">Subtotal</span>
              <span className="text-xl font-bold text-primary">{price(subtotal)}</span>
            </div>
            <Link
              to={paths.checkout}
              onClick={onClose}
              className={`${buttonClasses('primary', 'md', true)} mb-2.5`}
            >
              Finalizar compra
            </Link>
            <Link
              to={paths.cart}
              onClick={onClose}
              className={buttonClasses('outline', 'sm', true)}
            >
              Ver carrito
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  )
}
