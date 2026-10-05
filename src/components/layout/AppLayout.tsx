import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { DemoBar } from '../demo/DemoBar'
import { PageSkeleton } from '../ui/Skeleton'
import { Footer } from './Footer'
import { Header } from './Header'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <DemoBar />
      <TopBar />
      <Header />
      <main id="contenido" className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
