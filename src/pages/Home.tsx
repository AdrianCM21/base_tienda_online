import { brand } from '@/config/brand'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Provisorio (Fase 4). */
export default function Home() {
  useDocumentTitle()
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12">
      <p className="text-xs font-bold tracking-wide text-subtle uppercase">Fase 4</p>
      <h1 className="mt-1 text-[28px] font-bold">{brand.name}</h1>
      <p className="mt-2 text-sm text-muted">{brand.tagline}</p>
    </section>
  )
}
