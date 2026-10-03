import { Outlet } from 'react-router-dom'
import { PageStub } from '@/components/ui/PageStub'

/** Provisorio (Fase 8): aviso de modo demo + placeholder. */
export function AdminLayout() {
  return (
    <div>
      <div role="status" className="bg-dark px-6 py-2 text-center text-[12.5px] text-on-dark">
        Modo demo — los cambios no se guardan
      </div>
      <Outlet />
    </div>
  )
}

export function AdminHome() {
  return <PageStub title="Panel administrador" phase="Fase 8" />
}
