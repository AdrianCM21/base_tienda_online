import { Link, Outlet } from 'react-router-dom'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'

/** Layout provisorio (Fase 1). TopBar, Header y Footer reales llegan en la Fase 3. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-dark px-6 py-[18px]">
        <Link
          to={paths.home}
          className="font-heading text-[28px] font-bold tracking-[0.5px] text-white hover:text-white"
        >
          {brand.logoText}
        </Link>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-dark px-6 py-4 text-center text-[12.5px] text-footer-copy">
        © 2026 {brand.name}. Todos los derechos reservados.
      </footer>
    </div>
  )
}
