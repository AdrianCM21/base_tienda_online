type Row = { key: string; label: string; value: string; share: number; detail?: string }

/** Barras horizontales de participación (% del total); el texto de cada fila basta para entenderlas sin ver la barra. */
export function ShareBars({
  rows,
  empty = 'Sin datos en este período.',
}: {
  rows: Row[]
  empty?: string
}) {
  if (!rows.length) return <p className="m-0 text-[13.5px] text-muted">{empty}</p>
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate font-semibold">{r.label}</span>
            <span className="shrink-0 text-muted">
              {r.value} · <strong className="text-text">{Math.round(r.share * 100)}%</strong>
            </span>
          </div>
          <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-light">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(2, r.share * 100)}%` }}
            />
          </div>
          {r.detail && <p className="m-0 mt-0.5 text-xs text-subtle">{r.detail}</p>}
        </li>
      ))}
    </ul>
  )
}
