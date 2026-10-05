import { ExternalLink, Keyboard, LogOut, Menu, Moon, Search, Store, Sun } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { DemoBar } from '@/components/demo/DemoBar'
import { Drawer } from '@/components/ui/Drawer'
import { brand } from '@/config/brand'
import { adminPaths, paths } from '@/config/routes'
import { NAV_GROUPS } from './navigation'
import { useAdminMode } from '@/hooks/useAdminMode'
import { useAdminSession } from '@/hooks/useAdminSession'
import { useAdminShortcuts, useShortcutsEnabled } from '@/hooks/useShortcuts'
import { useNoIndex } from '@/hooks/useNoIndex'
import { CommandPalette } from './CommandPalette'
import { NotificationsBell } from './NotificationsBell'
import { ShortcutsDialog } from './ShortcutsDialog'

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
      <div className="flex flex-col gap-4">
        {NAV_GROUPS.map((g, gi) => (
          <div key={gi}>
            {g.title && (
              <p className="m-0 mb-1 px-3 text-[11px] font-bold tracking-[0.6px] text-on-dark-muted uppercase">
                {g.title}
              </p>
            )}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {g.items.map(({ to, label, icon: Icon, ...rest }) => (
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
          </div>
        ))}
      </div>
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
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-control text-dark hover:bg-light min-[900px]:hidden"
      >
        <Menu size={24} aria-hidden="true" />
      </button>
      <Drawer open={open} onClose={close} title="Panel administrador">
        <div className="h-full bg-[var(--admin-sidebar)] p-3">
          <NavList onLogout={onLogout} />
        </div>
      </Drawer>
    </>
  )
}

/**
 * Raíz del panel: la barra de demo (con los colores de la tienda) y, debajo, el panel con su propio
 * estilo neutro. La marca solo aparece como acento; el modo oscuro es solo del panel.
 */
export function AdminShell({ children }: { children?: ReactNode }) {
  const { mode } = useAdminMode()
  return (
    <>
      <DemoBar />
      <div
        className={`admin-theme min-h-screen bg-bg text-text ${mode === 'dark' ? 'admin-dark' : ''}`}
      >
        {children}
      </div>
    </>
  )
}

/** Layout del panel: exige la sesión falsa, muestra el aviso de demo, la navegación y la barra superior. */
export function AdminLayout() {
  useNoIndex()
  const { loggedIn, logout } = useAdminSession()
  const { mode, toggle } = useAdminMode()
  const { enabled: shortcutsOn, setEnabled: setShortcutsOn } = useShortcutsEnabled()
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  useAdminShortcuts({
    enabled: shortcutsOn && loggedIn,
    onSearch: () => setSearchOpen(true),
    onHelp: () => setHelpOpen(true),
  })

  // Ctrl+K (o ⌘K) abre el buscador global desde cualquier pantalla del panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  if (!loggedIn) return <Navigate to={adminPaths.login} replace />

  return (
    <AdminShell>
      <AdminDemoNotice />
      <div className="flex items-start">
        <aside className="sticky top-[var(--demo-bar-h,0px)] hidden h-[calc(100vh-var(--demo-bar-h,0px))] w-[232px] shrink-0 overflow-y-auto bg-[var(--admin-sidebar)] p-3 min-[900px]:block">
          <div className="mb-4 px-3 pt-2 font-heading text-lg font-bold tracking-[0.5px] text-white">
            {brand.logoText}
          </div>
          <NavList onLogout={logout} />
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-[var(--demo-bar-h,0px)] z-30 flex h-14 items-center gap-3 border-b border-light bg-white px-4 min-[900px]:px-8">
            <MobileNav onLogout={logout} />
            <span className="font-heading text-lg font-bold tracking-[0.5px] text-dark min-[900px]:hidden">
              {brand.logoText}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar en el panel (Ctrl+K)"
                aria-haspopup="dialog"
                className="flex items-center gap-2 rounded-control border border-light bg-bg px-3 py-2 text-[13px] text-muted hover:bg-light hover:text-dark"
              >
                <Search size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Buscar</span>
                <kbd
                  aria-hidden="true"
                  className="hidden rounded-[4px] border border-light bg-white px-1.5 py-0.5 font-sans text-[11px] sm:inline"
                >
                  Ctrl K
                </kbd>
              </button>
              <Link
                to={paths.home}
                className="hidden items-center gap-1.5 rounded-control px-3 py-2 text-[13px] font-semibold text-muted hover:bg-light hover:text-dark sm:inline-flex"
              >
                <ExternalLink size={15} aria-hidden="true" />
                Ver tienda
              </Link>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                aria-label="Atajos de teclado (?)"
                aria-haspopup="dialog"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-light hover:text-dark sm:flex"
              >
                <Keyboard size={19} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-pressed={mode === 'dark'}
                aria-label="Modo oscuro"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-light hover:text-dark"
              >
                {mode === 'dark' ? (
                  <Sun size={19} aria-hidden="true" />
                ) : (
                  <Moon size={19} aria-hidden="true" />
                )}
              </button>
              <NotificationsBell />
              <span
                aria-hidden="true"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white"
              >
                AD
              </span>
            </div>
          </header>
          <main className="mx-auto max-w-[1100px] px-4 py-6 min-[900px]:px-8 min-[900px]:py-8">
            {/* Cada sección se carga bajo demanda. */}
            <Suspense
              fallback={
                <p role="status" className="p-10 text-center text-sm text-muted">
                  Cargando…
                </p>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      <CommandPalette open={searchOpen} onClose={closeSearch} />
      <ShortcutsDialog
        open={helpOpen}
        onClose={closeHelp}
        enabled={shortcutsOn}
        onEnabledChange={setShortcutsOn}
      />
    </AdminShell>
  )
}
