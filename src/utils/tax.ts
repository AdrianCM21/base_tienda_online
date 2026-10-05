/** IVA contenido en un precio que ya lo incluye (tasa en %). */
export const ivaIncluded = (price: number, rate: number): number =>
  Math.round(price - price / (1 + rate / 100))

/** Precio final cuando el precio cargado no incluye IVA. */
export const withIva = (net: number, rate: number): number => net + Math.round((net * rate) / 100)
