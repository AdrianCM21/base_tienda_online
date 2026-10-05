import { Check, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { SelectField, TextField } from '@/components/ui/FormField'
import { useToast } from '@/hooks/useToast'
import { StatusBadge } from '../StatusBadge'
import { PERMISSIONS, ROLES, type Role } from './roles'
import { Section } from './SettingsSection'

type User = { id: string; name: string; email: string; role: Role; active: boolean }
const INITIAL: User[] = [
  {
    id: 'u1',
    name: 'Administrador demo',
    email: 'admin@demo.test',
    role: 'Propietario',
    active: true,
  },
  {
    id: 'u2',
    name: 'Lucía Benítez',
    email: 'lucia@tiendademo.example',
    role: 'Administrador',
    active: true,
  },
  {
    id: 'u3',
    name: 'Carlos Ramírez',
    email: 'carlos@tiendademo.example',
    role: 'Ventas',
    active: true,
  },
  {
    id: 'u4',
    name: 'Natalia Cabrera',
    email: 'natalia@tiendademo.example',
    role: 'Inventario',
    active: false,
  },
]

export function UsersTab() {
  const { toast } = useToast()
  const [users, setUsers] = useState(INITIAL)
  const [inviting, setInviting] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Ventas')
  const [error, setError] = useState('')

  const invite = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return setError('Ingresá un email válido')
    setUsers((cur) => [
      ...cur,
      {
        id: `u${cur.length + 1}`,
        name: email.split('@')[0],
        email: email.trim(),
        role,
        active: false,
      },
    ])
    setInviting(false)
    setEmail('')
    setError('')
    toast('Invitación enviada (solo en esta pantalla)')
  }

  return (
    <div className="flex flex-col gap-5">
      <Section
        title="Usuarios del panel"
        hint="Quiénes pueden entrar y con qué rol. Los cambios se ven solo en esta pantalla."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <caption className="sr-only">Usuarios del panel</caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                {['Usuario', 'Rol', 'Estado'].map((h) => (
                  <th key={h} scope="col" className="px-2 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-light">
                  <td className="px-2 py-2.5">
                    <span className="block font-semibold">{u.name}</span>
                    <span className="block text-xs text-subtle">{u.email}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <select
                      aria-label={`Rol de ${u.name}`}
                      value={u.role}
                      disabled={u.role === 'Propietario'}
                      onChange={(e) =>
                        setUsers((cur) =>
                          cur.map((x) =>
                            x.id === u.id ? { ...x, role: e.target.value as Role } : x,
                          ),
                        )
                      }
                      className="rounded-control border border-light bg-white px-2.5 py-2 text-[13px] font-semibold disabled:opacity-60"
                    >
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2.5">
                    <StatusBadge tone={u.active ? 'green' : 'amber'}>
                      {u.active ? 'Activo' : 'Invitación pendiente'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setInviting(true)}>
          <Plus size={16} aria-hidden="true" />
          Invitar usuario
        </Button>
      </Section>

      <Section title="Permisos por rol" hint="Referencia de lo que puede hacer cada rol.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <caption className="sr-only">Permisos por rol</caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="px-2 py-2 font-semibold">
                  Permiso
                </th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="px-2 py-2 text-center font-semibold">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.label} className="border-t border-light">
                  <th scope="row" className="px-2 py-2.5 text-left font-normal">
                    {p.label}
                  </th>
                  {ROLES.map((r) => (
                    <td key={r} className="px-2 py-2.5 text-center">
                      {p.roles.includes(r) ? (
                        <>
                          <Check
                            size={16}
                            className="mx-auto text-emerald-700"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Sí</span>
                        </>
                      ) : (
                        <>
                          <Minus size={16} className="mx-auto text-subtle" aria-hidden="true" />
                          <span className="sr-only">No</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Drawer
        open={inviting}
        onClose={() => setInviting(false)}
        side="right"
        title="Invitar usuario"
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            invite()
          }}
          className="flex flex-col gap-4 p-5"
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="persona@tuempresa.com"
          />
          <SelectField
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            hint={`${PERMISSIONS.filter((p) => p.roles.includes(role)).length} de ${PERMISSIONS.length} permisos`}
          >
            {ROLES.filter((r) => r !== 'Propietario').map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectField>
          <Button type="submit">Enviar invitación</Button>
        </form>
      </Drawer>
    </div>
  )
}
