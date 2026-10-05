import type { Product } from '@/types/product'

/** Datos del editor de producto del admin (todo como texto/booleanos, listo para formularios). */
export type ColorRow = { id: string; name: string; hex: string; stock: string; priceDelta: string }
export type SpecRow = { id: string; key: string; value: string; filterable: boolean }

export type ProductDraft = {
  name: string
  brand: string
  categoryId: string
  subcategoryId: string
  shortDescription: string
  description: string
  status: 'activo' | 'borrador'
  keywords: string
  price: string
  oldPrice: string
  installments: string
  freeShipping: boolean
  sku: string
  stock: string
  lowStockAlert: string
  allowBackorder: boolean
  unit: string
  hasVariants: boolean
  variantTypes: { color: boolean; size: boolean; measure: boolean }
  colors: ColorRow[]
  sizes: string[]
  measures: string
  images: string[]
  specs: SpecRow[]
  seoTitle: string
  seoDescription: string
  slug: string
}

export const UNITS = ['Unidad', 'Par', 'Metro', 'Kilo', 'Litro', 'Caja', 'Pack'] as const
export const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42'] as const

let counter = 0
export const rowId = (): string => `row-${++counter}`

export function blankDraft(): ProductDraft {
  return {
    name: '',
    brand: '',
    categoryId: '',
    subcategoryId: '',
    shortDescription: '',
    description: '',
    status: 'borrador',
    keywords: '',
    price: '',
    oldPrice: '',
    installments: '1',
    freeShipping: false,
    sku: '',
    stock: '0',
    lowStockAlert: '5',
    allowBackorder: false,
    unit: 'Unidad',
    hasVariants: false,
    variantTypes: { color: true, size: false, measure: false },
    colors: [],
    sizes: [],
    measures: '',
    images: [],
    specs: [],
    seoTitle: '',
    seoDescription: '',
    slug: '',
  }
}

export function toDraft(p: Product): ProductDraft {
  return {
    ...blankDraft(),
    name: p.name,
    brand: p.brand,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    shortDescription: p.shortDescription,
    description: p.description,
    status: p.status,
    keywords: (p.keywords ?? []).join(', '),
    price: String(p.price),
    oldPrice: p.oldPrice ? String(p.oldPrice) : '',
    installments: String(p.installments?.count ?? 1),
    freeShipping: !!p.tags?.includes('envio-gratis'),
    sku: p.sku,
    stock: String(p.stock),
    hasVariants: p.colors.length > 0,
    colors: p.colors.map((c) => ({
      id: rowId(),
      name: c.name,
      hex: c.hex,
      stock: String(c.stock),
      priceDelta: c.priceDelta ? String(c.priceDelta) : '',
    })),
    images: [...p.images],
    specs: Object.entries(p.specs).map(([key, value]) => ({
      id: rowId(),
      key,
      value,
      filterable: false,
    })),
    seoTitle: p.name.slice(0, 60),
    seoDescription: p.shortDescription,
    slug: p.slug,
  }
}

/** Descuento en % entre precio anterior y actual (0 si no hay oferta válida). */
export function discountPercent(price: string, oldPrice: string): number {
  const p = Number(price)
  const o = Number(oldPrice)
  if (!(p > 0) || !(o > p)) return 0
  return Math.round(((o - p) / o) * 100)
}

/** Texto de la dirección que se vería en la tienda. */
export const productUrl = (slug: string, origin = 'https://tu-tienda.com'): string =>
  `${origin}/producto/${slug || 'nombre-del-producto'}`
