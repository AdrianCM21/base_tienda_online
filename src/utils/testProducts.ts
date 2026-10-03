import type { Product } from '@/types/product'

/** Fábrica de productos para tests. */
export function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: 'x',
    sku: 'TD-1',
    slug: 'x',
    name: 'Producto',
    brand: 'Marca',
    categoryId: 'informatica',
    subcategoryId: 'notebooks',
    price: 1000,
    stock: 5,
    shortDescription: '',
    description: '',
    images: [],
    colors: [],
    specs: {},
    createdAt: '2026-01-01',
    status: 'activo',
    ...over,
  }
}
