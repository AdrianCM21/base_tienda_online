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

/** Rutas del panel administrador demo. */
export const adminPaths = {
  login: '/admin/login',
  products: '/admin/productos',
  productNew: '/admin/productos/nuevo',
  product: (id: string) => `/admin/productos/${id}`,
  import: '/admin/productos/importar',
  /** Ruta anterior del importador (redirige a `import`). */
  legacyImport: '/admin/importar',
  orders: '/admin/pedidos',
  customers: '/admin/clientes',
  inventory: '/admin/inventario',
  reports: '/admin/reportes',
  activity: '/admin/actividad',
  coupons: '/admin/marketing/cupones',
  banks: '/admin/marketing/bancos',
  banners: '/admin/marketing/banners',
  categories: '/admin/categorias',
  appearance: '/admin/apariencia',
  settings: '/admin/configuracion',
} as const
