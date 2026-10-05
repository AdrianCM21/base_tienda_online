/**
 * Acceso al catálogo. Hoy lee JSON local; las pantallas solo usan estas funciones,
 * así que cambiar a una API real implica tocar únicamente este archivo.
 */
import banksData from '@/data/banks.json'
import categoriesData from '@/data/categories.json'
import productsData from '@/data/products.json'
import type { Bank } from '@/types/bank'
import type { CatalogQuery, CatalogResult } from '@/types/catalog'
import type { Category, Subcategory } from '@/types/category'
import type { Product } from '@/types/product'
import { computeFacets, filterProducts, matchesQuery } from '@/utils/filters'
import { paginate } from '@/utils/paginate'
import { isOnSale } from '@/utils/product'
import { sortProducts } from '@/utils/sort'
import { normalizeText } from '@/utils/text'

export const PAGE_SIZE = 9

const categories = categoriesData as Category[]
const allProducts = productsData as unknown as Product[]
/** Solo productos publicados. */
const products = allProducts.filter((p) => p.status === 'activo')

export const getBanks = (): Bank[] => banksData

// ---------- categorías ----------
export const getCategories = (): Category[] => categories

export const getCategory = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug)

export const getSubcategories = (category: Category): Subcategory[] =>
  category.groups.flatMap((g) => g.items)

export function getSubcategory(
  slug: string,
): { category: Category; subcategory: Subcategory } | undefined {
  for (const category of categories) {
    const subcategory = getSubcategories(category).find((s) => s.slug === slug)
    if (subcategory) return { category, subcategory }
  }
  return undefined
}

/**
 * Resuelve una ruta `/categoria/:slug/:sub?`. `slug` puede ser una categoría o una subcategoría
 * (p. ej. `/categoria/notebooks`).
 */
export function resolveListing(
  slug: string,
  sub?: string,
): { category: Category; subcategory?: Subcategory } | undefined {
  const category = getCategory(slug)
  if (category) {
    if (!sub) return { category }
    const subcategory = getSubcategories(category).find((s) => s.slug === sub)
    return subcategory ? { category, subcategory } : undefined
  }
  return getSubcategory(slug)
}

// ---------- productos ----------
export const getAllProducts = (): Product[] => products

/** Todos los productos, incluidos los borradores (panel admin). */
export const getAllProductsIncludingDrafts = (): Product[] => allProducts

export const getProductById = (id: string): Product | undefined => products.find((p) => p.id === id)

export const getProduct = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug)

export function getFeatured(limit = 8): Product[] {
  return products.filter((p) => p.tags?.includes('destacado')).slice(0, limit)
}

/** Productos con precio rebajado, los de mayor ahorro porcentual primero. */
export function getOnSale(limit = 8, skip = 0): Product[] {
  const pct = (p: Product) => (p.oldPrice! - p.price) / p.oldPrice!
  return products
    .filter(isOnSale)
    .sort((a, b) => pct(b) - pct(a))
    .slice(skip, skip + limit)
}

/** Misma subcategoría primero, luego misma categoría. */
export function getRelated(product: Product, limit = 4): Product[] {
  const others = products.filter((p) => p.id !== product.id)
  const same = sortProducts(others.filter((p) => p.subcategoryId === product.subcategoryId))
  const rest = sortProducts(
    others.filter(
      (p) => p.categoryId === product.categoryId && p.subcategoryId !== product.subcategoryId,
    ),
  )
  const fallback = sortProducts(others.filter((p) => p.categoryId !== product.categoryId))
  return [...same, ...rest, ...fallback].slice(0, limit)
}

/** Sugerencias para el buscador del header. */
export function searchSuggestions(q: string, limit = 5): Product[] {
  if (!normalizeText(q)) return []
  return sortProducts(products.filter((p) => matchesQuery(p, q))).slice(0, limit)
}

function scopeFor({ category, subcategory }: Pick<CatalogQuery, 'category' | 'subcategory'>) {
  const resolved = category
    ? resolveListing(category, subcategory)
    : subcategory
      ? getSubcategory(subcategory)
      : undefined
  const specKeys = resolved
    ? [
        ...new Set(
          (resolved.subcategory
            ? [resolved.subcategory]
            : getSubcategories(resolved.category)
          ).flatMap((s) => s.filterSpecs ?? []),
        ),
      ]
    : []
  const scope = resolved
    ? products.filter(
        (p) =>
          p.categoryId === resolved.category.slug &&
          (!resolved.subcategory || p.subcategoryId === resolved.subcategory.slug),
      )
    : products
  return { scope, specKeys }
}

/** Listado completo: filtra, calcula facetas, ordena y pagina. */
export function queryProducts(query: CatalogQuery = {}): CatalogResult {
  const { scope, specKeys } = scopeFor(query)
  const filters = query.filters ?? {}
  const matched = sortProducts(filterProducts(scope, filters), query.sort)
  const page = paginate(matched, query.page, query.pageSize ?? PAGE_SIZE)
  return { ...page, scopeTotal: scope.length, facets: computeFacets(scope, filters, specKeys) }
}
