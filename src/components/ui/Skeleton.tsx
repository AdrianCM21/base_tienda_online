/** Bloque gris pulsante (la animación se desactiva con "reducir movimiento"). */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-card bg-light motion-safe:animate-pulse ${className}`}
    />
  )
}

/** Esqueleto de página mientras se descarga el código de una ruta: título + grilla de tarjetas. */
export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="px-6 py-8">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="mb-2 h-8 w-64 max-w-full" />
      <Skeleton className="mb-8 h-4 w-40" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[330px]" />
        ))}
      </div>
    </div>
  )
}
