/**
 * Identidad de la tienda. Es el ÚNICO lugar donde se escribe el nombre de la marca.
 * Cambiar `name` / `logoText` actualiza header, footer, títulos y textos legales.
 */
export const brand = {
  name: 'Tienda Demo',
  legalName: 'Tienda Demo S.A.',
  logoText: 'TIENDA DEMO',
  tagline: 'Tecnología, hogar y más, en cuotas',
  contact: {
    email: 'hola@tiendademo.example',
    phone: '0981 234 567',
    address: 'Av. Principal 1234, Asunción',
  },
  /** Número en formato internacional, sin "+" ni espacios. */
  whatsapp: '595981234567',
  currency: {
    base: 'PYG',
    /** Tasa mock: 1 USD = usdRate Gs. */
    usdRate: 7300,
  },
  /** URL de la imagen del hero de la Home; vacío = ilustración por defecto. */
  heroImage: '' as string,
  freeShippingThreshold: 500_000,
  /** Costo de envío a domicilio por debajo del umbral de envío gratis. */
  shippingFee: 25_000,
} as const

export type Brand = typeof brand
