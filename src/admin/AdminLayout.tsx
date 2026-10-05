import {
  ClipboardList,
  FileSpreadsheet,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Settings,
  Store,
} from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { DemoBar } from '@/components/demo/DemoBar'
import { Drawer } from '@/components/ui/Drawer'
import { brand } from '@/config/brand'
import { adminPaths, paths } from '@/config/routes'
import { useAdminSession } from '@/hooks/useAdminSession'
import { useNoIndex } from '@/hooks/useNoIndex'

const NAV = [
  { to: paths.admin, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: adminPaths.products, label: 'Productos', icon: Package },
  { to: adminPaths.import, label: 'Importar XLSX', icon: FileSpreadsheet },
  { to: adminPaths.orders, label: 'Pedidos', icon: ClipboardList },
  { to: adminPaths.categories, label: 'Categorías', icon: FolderTree },
  { to: adminPaths.appearance, label: 'Apariencia', icon: Palette },
  { to: adminPaths.settings, label: 'Configuración', icon: Settings },
] as const

/** Aviso fijo: todo lo que se haga en el panel es de muestra. */
export function AdminDemoNotice() {
  return (
    <div
      role="note"
      className="bg-amber-100 px-6 py-2 text-center text-[12.5px] font-semibold text-amber-900"
    >
      Modo demo — los cambios no se guardan
    </div>
  )
}

function NavList({ onLogout }: { onLogout: () => void }) {
  const item =
    'flex items-center gap-2.5 rounded-control px-3 py-2.5 text-[13.5px] font-semibold transition-colors'
  return (
    <nav aria-label="Panel administrador" className="flex h-full flex-col">
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                `${item} ${isActive ? 'bg-white/15 text-white' : 'text-on-dark hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-white/15 pt-3">
        <Link to={paths.home} className={`${item} text-on-dark hover:bg-white/10 hover:text-white`}>
          <Store size={18} strokeWidth={1.6} aria-hidden="true" />
          Ver tienda
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className={`${item} text-left text-on-dark hover:bg-white/10 hover:text-white`}
        >
          <LogOut size={18} strokeWidth={1.6} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

function MobileNav({ onLogout }: { onLogout: () => void }) {
  // Al navegar cambia `key` y el menú se cierra solo.
  const { key } = useLocation()
  return <MobileNavInner key={key} onLogout={onLogout} />
}

function MobileNavInner({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú del panel"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-control text-white hover:bg-white/10 min-[900px]:hidden"
      >
        <Menu size={24} aria-hidden="true" />
      </button>
      <Drawer open={open} onClose={close} title="Panel administrador">
        <div className="h-full bg-dark p-3">
          <NavList onLogout={onLogout} />
        </div>
      </Drawer>
    </>
  )
}

export function AdminShell({ children }: { children?: ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>
}

/** Layout del panel: exige la sesión falsa, muestra el aviso de demo y la navegación lateral. */
export function AdminLayout() {
  useNoIndex()
  const { loggedIn, logout } = useAdminSession()
  if (!loggedIn) return <Navigate to={adminPaths.login} replace />

  return (
    <AdminShell>
      <DemoBar />
      <AdminDemoNotice />
      <div className="flex items-start">
        <aside className="sticky top-[var(--demo-bar-h,0px)] hidden h-[calc(100vh-var(--demo-bar-h,0px))] w-[232px] shrink-0 bg-dark p-3 min-[900px]:block">
          <div className="mb-4 px-3 pt-2 font-heading text-lg font-bold tracking-[0.5px] text-white">
            {brand.logoText}
          </div>
          <NavList onLogout={logout} />
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex items-center gap-3 bg-dark px-4 py-2.5 min-[900px]:hidden">
            <MobileNav onLogout={logout} />
            <span className="font-heading text-lg font-bold tracking-[0.5px] text-white">
              {brand.logoText}
            </span>
          </header>
          <main className="mx-auto max-w-[1100px] px-4 py-6 min-[900px]:px-8 min-[900px]:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminShell>
  )
}
