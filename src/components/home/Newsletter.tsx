import { useId, useState, type FormEvent } from 'react'
import { useToast } from '@/hooks/useToast'
import { isValidEmail } from '@/utils/validators'
import { Button } from '../ui/Button'

/** Suscripción simulada: valida el email y confirma, sin enviar nada. */
export function Newsletter() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputId = useId()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setDone(false)
      setError('Ingresá un email válido, por ejemplo tu@email.com')
      return
    }
    setError('')
    setDone(true)
    setEmail('')
    toast('¡Suscripción confirmada!')
  }

  return (
    <section className="bg-bg px-6 py-12 text-center">
      <h2 className="mb-2 text-2xl font-bold">Recibí ofertas exclusivas</h2>
      <p className="mb-5 text-[14.5px] text-muted">
        Suscribite y enterate antes que nadie de nuestras promociones.
      </p>
      <form onSubmit={submit} noValidate className="mx-auto flex max-w-[460px] gap-2.5">
        <label htmlFor={inputId} className="sr-only">
          Tu email
        </label>
        <input
          id={inputId}
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="min-w-0 flex-1 rounded-control border border-light bg-white px-3.5 py-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <Button type="submit">Suscribirme</Button>
      </form>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-3 text-[13px] font-semibold text-red-700"
        >
          {error}
        </p>
      )}
      {done && (
        <p className="mt-3 text-[13px] font-semibold text-primary">
          Listo, te vamos a avisar de las próximas ofertas. (Suscripción simulada: es una demo)
        </p>
      )}
    </section>
  )
}
