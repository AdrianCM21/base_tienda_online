import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { useDemoNotice } from '@/hooks/useDemoNotice'

/** Formulario de una pestaña de Configuración: se edita en pantalla y "Guardar" avisa que es una demo. */
export function SettingsForm({ children }: { children: ReactNode }) {
  const notice = useDemoNotice('Los cambios no se guardan: es una demostración')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    notice()
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {children}
      <div>
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}

export function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-card border border-light bg-white p-5">
      <h2 className="m-0 font-sans text-[15px] font-bold">{title}</h2>
      {hint && <p className="mt-1 mb-0 text-[13px] text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
