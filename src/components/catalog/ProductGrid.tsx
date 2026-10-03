import type { ReactNode } from 'react'

/** Grilla de tarjetas: auto-fit, mínimo 200px, gap 18px. */
export function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">{children}</div>
  )
}
