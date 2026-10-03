/** Rutas de la app en un solo lugar. Usar estos helpers en lugar de strings sueltos. */
export const paths = {
  home: '/',
  category: (slug: string, sub?: string) =>
    sub ? `/categoria/${slug}/${sub}` : `/categoria/${slug}`,
  search: (q = '') => (q ? `/buscar?q=${encodeURIComponent(q)}` : '/buscar'),
  product: (slug: string, color?: string) =>
    color ? `/producto/${slug}?color=${encodeURIComponent(color)}` : `/producto/${slug}`,
  cart: '/carrito',
  checkout: '/checkout',
  order: (id: string) => `/pedido/${id}`,
  admin: '/admin',
} as const
