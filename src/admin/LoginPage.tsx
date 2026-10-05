import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/FormField'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'
import { useAdminSession } from '@/hooks/useAdminSession'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useNoIndex } from '@/hooks/useNoIndex'
import { AdminDemoNotice, AdminShell } from './AdminLayout'

/** Pantalla de acceso de muestra: no hay cuentas reales, un botón entra directo. */
export default function LoginPage() {
  useNoIndex()
  useDocumentTitle('Acceso · Admin')
  const { loggedIn, login } = useAdminSession()
  const navigate = useNavigate()
  if (loggedIn) return <Navigate to={paths.admin} replace />

  return (
    <AdminShell>
      <AdminDemoNotice />
      <div className="mx-auto flex max-w-[400px] flex-col px-6 py-14">
        <div className="mb-6 text-center">
          <div className="font-heading text-[26px] font-bold tracking-[0.5px] text-dark">
            {brand.logoText}
          </div>
          <h1 className="mt-3 mb-1 text-[22px] font-bold">Panel administrador</h1>
          <p className="m-0 text-[13.5px] text-muted">
            Acceso de demostración: no hay cuentas reales.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            login()
            navigate(paths.admin)
          }}
          className="flex flex-col gap-3.5 rounded-card border border-light bg-white p-6"
        >
          <TextField label="Email" type="email" readOnly value="admin@demo.test" />
          <TextField label="Contraseña" type="password" readOnly value="demo-demo" />
          <Button type="submit" block className="mt-1 py-3">
            Entrar como demo
          </Button>
        </form>
      </div>
    </AdminShell>
  )
}
