import { paths } from './routes'

/** Alto de la barra de demo en px (también define `--demo-bar-h`). */
export const DEMO_BAR_HEIGHT = 40

/** Se evalúa en cada llamada para poder probarlo; con `VITE_DEMO_BAR=false` el build la quita. */
export const isDemoBarEnabled = (): boolean => import.meta.env.VITE_DEMO_BAR !== 'false'

export type DemoScreen = {
  id: string
  label: string
  /** Destino al hacer clic (puede ajustarse tras la preparación, ver `prepare`). */
  to: string
  /**
   * Preparación previa para que la pantalla no abra vacía:
   * - `cart`: llena el carrito con productos de ejemplo si está vacío.
   * - `order`: crea un pedido de ejemplo si no hay ninguno y va a ese pedido.
   */
  prepare?: 'cart' | 'order'
  /** ¿La ruta actual corresponde a esta pantalla? */
  isActive: (pathname: string) => boolean
}

/** Producto de ejemplo: tiene varios colores y está en oferta. */
export const SAMPLE_PRODUCT_SLUG = 'notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd'

/** Contenido del carrito de ejemplo (por slug; el color por defecto es el primero con stock). */
export const SAMPLE_CART: { slug: string; colorName?: string; quantity: number }[] = [
  { slug: SAMPLE_PRODUCT_SLUG, colorName: 'Azul Abismo', quantity: 1 },
  { slug: 'mochila-porta-notebook-15-6', quantity: 1 },
]

const startsWith = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

export const demoScreens: DemoScreen[] = [
  { id: 'inicio', label: 'Inicio', to: paths.home, isActive: (p) => p === '/' },
  {
    id: 'categoria',
    label: 'Categoría',
    to: paths.category('notebooks'),
    isActive: startsWith('/categoria'),
  },
  {
    id: 'busqueda',
    label: 'Búsqueda',
    to: paths.search('lenovo'),
    isActive: startsWith('/buscar'),
  },
  {
    id: 'producto',
    label: 'Producto',
    to: paths.product(SAMPLE_PRODUCT_SLUG),
    isActive: startsWith('/producto'),
  },
  {
    id: 'carrito',
    label: 'Carrito',
    to: paths.cart,
    prepare: 'cart',
    isActive: startsWith('/carrito'),
  },
  {
    id: 'checkout',
    label: 'Checkout',
    to: paths.checkout,
    prepare: 'cart',
    isActive: startsWith('/checkout'),
  },
  {
    id: 'confirmacion',
    label: 'Confirmación',
    to: paths.order(':id'),
    prepare: 'order',
    isActive: startsWith('/pedido'),
  },
  { id: 'admin', label: 'Admin', to: paths.admin, isActive: startsWith('/admin') },
]
