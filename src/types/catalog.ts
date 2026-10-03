import type { Product } from './product'

export type SortKey = 'relevancia' | 'menor-precio' | 'mayor-precio' | 'nuevos'

export type ProductFilters = {
  /** Texto de búsqueda (todas las palabras deben coincidir). */
  q?: string
  brands?: string[]
  /** Nombres de color. */
  colors?: string[]
  priceMin?: number
  priceMax?: number
  /** clave de especificación → valores aceptados. */
  specs?: Record<string, string[]>
  onlyOffer?: boolean
  inStock?: boolean
}

/** Grupo de filtros que se ignora al filtrar (para calcular conteos de ese mismo grupo). */
export type FilterOmit = { brands?: boolean; colors?: boolean; price?: boolean; spec?: string }

export type Facet = { value: string; count: number }
export type ColorFacet = Facet & { hex: string }

export type Facets = {
  brands: Facet[]
  colors: ColorFacet[]
  specs: Record<string, Facet[]>
  /** Rango de precios de los productos disponibles para los demás filtros. */
  priceRange: { min: number; max: number }
}

export type CatalogQuery = {
  /** Slug de categoría. */
  category?: string
  /** Slug de subcategoría. */
  subcategory?: string
  filters?: ProductFilters
  sort?: SortKey
  page?: number
  pageSize?: number
}

export type CatalogResult = {
  items: Product[]
  /** Resultados que cumplen los filtros. */
  total: number
  /** Productos del alcance (categoría/subcategoría) sin filtros. */
  scopeTotal: number
  page: number
  pageSize: number
  pageCount: number
  /** Posición 1-based del primer y último resultado de la página (0 si no hay). */
  from: number
  to: number
  facets: Facets
}
