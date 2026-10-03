/** Rutas de la app en un solo lugar. Usar estos helpers en lugar de strings sueltos. */
export const paths = {
  home: '/',
  category: (slug: string, sub?: string) =>
    sub ? `/categoria/${slug}/${sub}` : `/categoria/${slug}`,
  search: (q = '') => (q ? `/buscar?q=${encodeURIComponent(q)}` : '/buscar'),
  product: (slug: string, color?: string) =>
    color ? `/producto/${slug}?color=${encodeURIComponent(color)}` : `/producto/${slug}`,
  /** Todos los productos en oferta (la búsqueda interpreta `ofertas=1`). */
  offers: '/buscar?ofertas=1',
  cart: '/carrito',
  checkout: '/checkout',
  order: (id: string) => `/pedido/${id}`,
  admin: '/admin',
} as const
