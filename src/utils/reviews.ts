import type { Product } from '@/types/product'

export type Review = {
  id: string
  author: string
  rating: number
  title: string
  text: string
  /** `AAAA-MM-DD` */
  date: string
  verified: boolean
}

const AUTHORS = [
  'María F.',
  'Carlos R.',
  'Lucía B.',
  'Diego A.',
  'Andrea M.',
  'Javier S.',
  'Camila P.',
  'Roberto G.',
  'Natalia C.',
  'Sebastián L.',
]
const BY_STARS: Record<number, { title: string; text: string }[]> = {
  5: [
    {
      title: 'Excelente compra',
      text: 'Llegó antes de lo esperado y funciona perfecto. Superó mis expectativas por el precio.',
    },
    {
      title: 'Muy recomendable',
      text: 'Calidad impecable y muy bien empacado. Lo volvería a comprar sin dudar.',
    },
    {
      title: 'Justo lo que buscaba',
      text: 'Cumple con todo lo que prometen. La atención y la entrega fueron muy buenas.',
    },
  ],
  4: [
    {
      title: 'Muy bueno',
      text: 'Buen producto en general, cumple su función. Le daría 5 estrellas si el envío hubiera sido más rápido.',
    },
    {
      title: 'Buena relación precio-calidad',
      text: 'Está muy bien por lo que cuesta. Recomendado para uso diario.',
    },
  ],
  3: [
    {
      title: 'Cumple',
      text: 'Hace lo que tiene que hacer, aunque esperaba un poco más en terminaciones.',
    },
  ],
  2: [
    {
      title: 'Regular',
      text: 'No es lo que esperaba, aunque la tienda respondió rápido a mis consultas.',
    },
  ],
  1: [
    {
      title: 'No me convenció',
      text: 'Tuve inconvenientes con el producto. La atención al cliente me ayudó a resolverlo.',
    },
  ],
}

/** Hash determinista (FNV-1a) para que las opiniones de un producto sean siempre las mismas. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

const MAX_DATE = Date.UTC(2026, 8, 30)

/** Opiniones ficticias y deterministas, coherentes con la calificación del producto. */
export function generateReviews(product: Product, limit = 6): Review[] {
  const total = product.reviewCount ?? 0
  const avg = product.rating ?? 4.5
  const n = Math.min(limit, total)
  const reviews: Review[] = []
  for (let i = 0; i < n; i++) {
    const h = hash(`${product.id}:${i}`)
    // La mayoría cae cerca del promedio; alguna se aleja un poco.
    const delta = [0, 0, 1, -1, 0, 1][h % 6]
    const rating = Math.min(
      5,
      Math.max(1, Math.round(avg) + delta - (avg < 4 && delta > 0 ? 1 : 0)),
    )
    const pool = BY_STARS[rating]
    const tpl = pool[(h >>> 3) % pool.length]
    const created = Date.parse(product.createdAt)
    const date = new Date(
      Math.min(MAX_DATE, created + (7 + ((h >>> 5) % 150) + i * 9) * 86_400_000),
    )
    reviews.push({
      id: `${product.id}-r${i}`,
      author: AUTHORS[(h >>> 7) % AUTHORS.length],
      rating,
      title: tpl.title,
      text: tpl.text,
      date: date.toISOString().slice(0, 10),
      verified: (h >>> 11) % 4 !== 0,
    })
  }
  return reviews.sort((a, b) => b.date.localeCompare(a.date))
}

/** Cantidad de opiniones por estrellas ([5★, 4★, 3★, 2★, 1★]); suma exactamente `count`. */
export function ratingDistribution(avg: number, count: number): number[] {
  const weights = [5, 4, 3, 2, 1].map((s) => Math.exp(-((s - avg) ** 2) / (2 * 0.8 ** 2)))
  const sum = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / sum) * count)
  const counts = raw.map(Math.floor)
  let rest = count - counts.reduce((a, b) => a + b, 0)
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0])
  for (const [, i] of order) {
    if (rest-- <= 0) break
    counts[i]++
  }
  return counts
}

/** "2026-08-12" → "12/08/2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
