import { useMemo } from 'react'
import type { Product } from '@/types/product'
import { formatDate, generateReviews, ratingDistribution } from '@/utils/reviews'
import { Stars } from '../ui/Stars'
import { Tabs } from '../ui/Tabs'

function Description({ product }: { product: Product }) {
  const paragraphs = product.description.split(/\n{2,}/)
  return (
    <div className="max-w-[760px] text-[14.5px] leading-[1.7]">
      {paragraphs.map((p, i) => (
        <p key={i} className="mt-0 mb-4">
          {p}
        </p>
      ))}
      {product.highlights && product.highlights.length > 0 && (
        <ul className="m-0 mb-4 list-disc pl-5">
          {product.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Specs({ product }: { product: Product }) {
  const rows: [string, string][] = [
    ...Object.entries(product.specs),
    ['Marca', product.brand],
    ...(product.warranty ? ([['Garantía', product.warranty]] as [string, string][]) : []),
    ['SKU', product.sku],
  ]
  return (
    <table className="w-full max-w-[760px] border-collapse text-[13.5px]">
      <caption className="sr-only">Especificaciones de {product.name}</caption>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-light">
            <th
              scope="row"
              className="w-2/5 bg-white py-2.5 pr-4 pl-3 text-left font-normal text-muted"
            >
              {k}
            </th>
            <td className="py-2.5 font-semibold">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Reviews({ product }: { product: Product }) {
  const total = product.reviewCount ?? 0
  const reviews = useMemo(() => generateReviews(product), [product])
  if (!total || product.rating === undefined)
    return <p className="text-muted">Todavía no hay opiniones para este producto.</p>
  const dist = ratingDistribution(product.rating, total)
  return (
    <div className="grid max-w-[900px] gap-8 min-[700px]:grid-cols-[220px_1fr]">
      <div>
        <div className="text-[44px] leading-none font-bold">{product.rating.toFixed(1)}</div>
        <Stars rating={product.rating} size={18} />
        <div className="mt-1 mb-4 text-[13px] text-muted">{total} opiniones</div>
        <ul className="m-0 list-none space-y-1.5 p-0">
          {dist.map((n, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-muted">
              <span className="w-7">{5 - i} ★</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-light">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${(n / total) * 100}%` }}
                />
              </span>
              <span className="w-7 text-right">{n}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="m-0 list-none space-y-5 p-0">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-light pb-5">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Stars rating={r.rating} size={14} />
              <strong className="text-[14px]">{r.title}</strong>
            </div>
            <p className="my-1.5 text-[14px] leading-relaxed">{r.text}</p>
            <p className="m-0 text-xs text-subtle">
              {r.author} · {formatDate(r.date)}
              {r.verified && ' · Compra verificada'}
            </p>
          </li>
        ))}
        <li className="text-xs text-subtle">Opiniones de ejemplo generadas para la demo.</li>
      </ul>
    </div>
  )
}

export function ProductTabs({ product }: { product: Product }) {
  return (
    <section className="px-6 py-10">
      <Tabs
        // Al cambiar de producto vuelve a "Descripción".
        key={product.id}
        tabs={[
          { id: 'descripcion', label: 'Descripción', content: <Description product={product} /> },
          {
            id: 'especificaciones',
            label: 'Especificaciones',
            content: <Specs product={product} />,
          },
          {
            id: 'opiniones',
            label: `Opiniones (${product.reviewCount ?? 0})`,
            content: <Reviews product={product} />,
          },
        ]}
      />
    </section>
  )
}
