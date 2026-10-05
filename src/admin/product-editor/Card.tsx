import type { ReactNode } from 'react'

/** Bloque con título para agrupar campos dentro de una pestaña del editor. */
export function Card({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="mb-5 rounded-card border border-light bg-white p-5">
      <h2 className="m-0 font-sans text-[15px] font-bold">{title}</h2>
      {hint && <p className="mt-1 mb-0 text-[13px] text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
