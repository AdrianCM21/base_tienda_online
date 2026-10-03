import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type Props = { title: string; phase: string; note?: string }

/** Marcador temporal de pantallas pendientes; se reemplaza fase a fase. */
export function PageStub({ title, phase, note }: Props) {
  useDocumentTitle(title)
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12">
      <p className="text-xs font-bold tracking-wide text-subtle uppercase">{phase}</p>
      <h1 className="mt-1 text-[28px] font-bold">{title}</h1>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </section>
  )
}
