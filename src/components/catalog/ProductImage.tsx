import { useState } from 'react'
import { luminance } from '@/utils/color'
import { CategoryIcon } from './CategoryIcon'

type Props = {
  src?: string
  alt: string
  /** Icono de lucide para el placeholder (normalmente el de la categoría). */
  icon?: string
  /** Color de la variante: tiñe el placeholder para que el cambio de color se note. */
  tint?: string
  /** Variante del placeholder (0-3) para simular distintas fotos en la galería. */
  view?: number
  className?: string
}

/** Imagen de producto; si no hay `src` (o falla) dibuja un placeholder tintable. */
const VIEWS = [
  { size: 62, rotate: 0 },
  { size: 50, rotate: -8 },
  { size: 74, rotate: 5 },
  { size: 56, rotate: 12 },
]

export function ProductImage({
  src,
  alt,
  icon = 'Package',
  tint,
  view = 0,
  className = '',
}: Props) {
  const v = VIEWS[((view % VIEWS.length) + VIEWS.length) % VIEWS.length]
  const [failed, setFailed] = useState<string | null>(null)

  if (src && failed !== src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(src)}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  const iconColor = tint && luminance(tint) > 0.45 ? '#101B2D' : '#FFFFFF'
  return (
    <div
      // Decorativa (alt vacío) → oculta a lectores de pantalla; con alt → imagen con nombre.
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      className={`flex h-full w-full items-center justify-center bg-light ${className}`}
    >
      <div
        className="flex aspect-square max-h-[300px] items-center justify-center rounded-[18%] shadow-[inset_0_0_0_1px_rgba(12,40,81,0.08)] transition-colors duration-200"
        style={{
          height: `${v.size}%`,
          transform: v.rotate ? `rotate(${v.rotate}deg)` : undefined,
          background: tint ?? 'color-mix(in srgb, var(--color-primary) 22%, white)',
        }}
      >
        <CategoryIcon
          name={icon}
          size="46%"
          color={tint ? iconColor : 'var(--color-primary)'}
          strokeWidth={1.4}
        />
      </div>
    </div>
  )
}
