type Datum = { label: string; value: number }

type Props = {
  data: Datum[]
  title: string
  /** Formatea el valor para el tooltip y la tabla accesible. */
  format: (value: number) => string
}

const W = 640
const H = 220
const PAD = { top: 12, right: 8, bottom: 26, left: 8 }

/** Gráfico de barras simple en SVG (sin librerías); incluye una tabla solo para lectores de pantalla. */
export function BarChart({ data, title, format }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const slot = innerW / Math.max(1, data.length)
  const barW = Math.min(34, slot * 0.62)
  const every = data.length > 10 ? 2 : 1

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="h-auto w-full">
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t)
          return (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--color-light)"
              strokeWidth={1}
            />
          )
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH
          const x = PAD.left + slot * i + (slot - barW) / 2
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={PAD.top + innerH - h}
                width={barW}
                height={Math.max(h, d.value > 0 ? 2 : 0)}
                rx={3}
                fill="var(--color-primary)"
              >
                <title>{`${d.label}: ${format(d.value)}`}</title>
              </rect>
              {i % every === 0 && (
                <text
                  x={x + barW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--color-subtle)"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
