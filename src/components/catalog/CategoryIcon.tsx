import {
  Camera,
  Car,
  Hammer,
  House,
  Laptop,
  Package,
  Refrigerator,
  Shirt,
  Sofa,
  Sparkles,
  Tv,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

const ICONS: Record<string, ComponentType<LucideProps>> = {
  Laptop,
  Tv,
  Refrigerator,
  Camera,
  Sparkles,
  House,
  Hammer,
  Car,
  Shirt,
  Sofa,
}

/** Icono lucide por nombre (el nombre viene de categories.json). */
export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Package
  return <Icon strokeWidth={1.5} aria-hidden="true" {...props} />
}
