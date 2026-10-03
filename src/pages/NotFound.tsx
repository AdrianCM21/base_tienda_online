import { Link } from 'react-router-dom'
import { PageStub } from '@/components/ui/PageStub'
import { paths } from '@/config/routes'

export default function NotFound() {
  return (
    <>
      <PageStub
        title="Página no encontrada"
        phase="Error 404"
        note="La dirección no existe o fue movida."
      />
      <p className="mx-auto max-w-[1200px] px-6 pb-12">
        <Link to={paths.home} className="font-semibold">
          Volver al inicio →
        </Link>
      </p>
    </>
  )
}
