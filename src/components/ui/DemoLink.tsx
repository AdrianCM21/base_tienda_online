import type { ReactNode } from 'react'
import { useToast } from '@/hooks/useToast'

type Props = { className?: string; message?: string; children: ReactNode }

/** Enlace a una sección que no existe en la demo: avisa con un toast en lugar de navegar. */
export function DemoLink({
  className = '',
  message = 'Esta sección no está disponible en la demo',
  children,
}: Props) {
  const { toast } = useToast()
  return (
    <button
      type="button"
      onClick={() => toast(message)}
      className={`cursor-pointer text-left ${className}`}
    >
      {children}
    </button>
  )
}
