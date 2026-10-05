import { ShoppingBag, User } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/useToast'
import { MiniCart } from '../cart/MiniCart'
import { CategoryMenu } from './CategoryMenu'
import { CurrencySwitch } from './CurrencySwitch'
import { MobileMenu } from './MobileMenu'
import { SearchBox } from './SearchBox'

export function Header() {
  const { count } = useCart()
  const { toast } = useToast()
  const [cartOpen, setCartOpen] = useState(false)
  const closeCart = useCallback(() => setCartOpen(false), [])
  return (
    <header className="relative flex flex-wrap items-center gap-3 bg-dark px-4 py-[18px] sm:flex-nowrap sm:gap-7 sm:px-6">
      <div className="flex shrink-0 items-center gap-2.5">
        <MobileMenu />
        <Link
          to={paths.home}
          className="shrink-0 font-heading text-[19px] font-bold tracking-[0.5px] text-white hover:text-white sm:text-[28px]"
        >
          {brand.logoText}
        </Link>
      </div>
      <CategoryMenu />
      <SearchBox />
      <div className="ml-auto shrink-0 sm:ml-0">
        <CurrencySwitch />
      </div>
      <button
        type="button"
        onClick={() => toast('Las cuentas de usuario no están disponibles en la demo')}
        className="hidden shrink-0 items-center gap-2 text-left text-white lg:flex"
      >
        <User size={22} strokeWidth={1.6} className="text-on-dark" aria-hidden="true" />
        <span className="text-[13px] leading-[1.2]">
          <span className="block text-on-dark-muted">Ingresá o registrate</span>
          <span className="block font-semibold">Mi cuenta</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={`Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
        className="relative shrink-0 text-white"
      >
        <ShoppingBag size={26} strokeWidth={1.6} aria-hidden="true" />
        <span className="absolute -top-1.5 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {count}
        </span>
      </button>
      <MiniCart open={cartOpen} onClose={closeCart} />
    </header>
  )
}
