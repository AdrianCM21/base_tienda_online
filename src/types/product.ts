export type ProductTag = 'nuevo' | 'destacado' | 'oferta' | 'envio-gratis'

export type ColorVariant = {
  name: string
  /** `#RRGGBB` */
  hex: string
  sku?: string
  stock: number
  /** Diferencia de precio (Gs) respecto al precio base del producto. */
  priceDelta?: number
  images?: string[]
}

export type Product = {
  id: string
  sku: string
  slug: string
  name: string
  brand: string
  categoryId: string
  subcategoryId: string
  /** Precio en Gs, entero. */
  price: number
  /** Si existe (y es > price) el producto está en oferta. */
  oldPrice?: number
  installments?: { count: number; interestFree: boolean }
  stock: number
  shortDescription: string
  description: string
  /** URLs de imágenes. Vacío = se muestran placeholders. */
  images: string[]
  colors: ColorVariant[]
  /** Especificaciones: alimentan la pestaña Especificaciones y los filtros. */
  specs: Record<string, string>
  highlights?: string[]
  tags?: ProductTag[]
  /** Palabras clave extra que mejoran la búsqueda (no se muestran). */
  keywords?: string[]
  rating?: number
  reviewCount?: number
  warranty?: string
  /** `AAAA-MM-DD` */
  createdAt: string
  status: 'activo' | 'borrador'
}
