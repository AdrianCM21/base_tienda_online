import { Star } from 'lucide-react'

/** Cinco estrellas rellenas según la calificación (redondeada). */
export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const filled = Math.round(rating)
  return (
    <span
      className="inline-flex gap-0.5 text-primary"
      role="img"
      aria-label={`${rating} de 5 estrellas`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.6}
          fill={i < filled ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
