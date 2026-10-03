import { Lock } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'

/** Layout simplificado del checkout: sin buscador, categorías ni footer completo. */
export function CheckoutLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between bg-dark px-6 py-4">
        <Link
          to={paths.home}
          className="font-heading text-2xl font-bold tracking-[0.5px] text-white hover:text-white"
        >
          {brand.logoText}
        </Link>
        <span className="flex items-center gap-2 text-[13px] font-semibold text-on-dark-link">
          <Lock size={16} strokeWidth={1.6} aria-hidden="true" />
          Compra 100% segura
        </span>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-light bg-white px-6 py-4 text-center text-[12.5px] text-subtle">
        © 2026 {brand.name}. Todos los derechos reservados.
      </footer>
    </div>
  )
}
