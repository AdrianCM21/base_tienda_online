import { brand } from '@/config/brand'
import type { Currency } from '@/types/currency'

/** 4590000 → "4.590.000" */
export function formatNumber(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function formatGs(gs: number): string {
  return `Gs. ${formatNumber(gs)}`
}

/** 628.767 → "USD 628,77" */
export function formatUsd(usd: number): string {
  const [int, dec] = usd.toFixed(2).split('.')
  return `USD ${formatNumber(Number(int))},${dec}`
}

export function gsToUsd(gs: number, rate: number = brand.currency.usdRate): number {
  return gs / rate
}

/** Formatea un monto expresado en Gs en la moneda elegida. */
export function formatPrice(
  gs: number,
  currency: Currency,
  rate: number = brand.currency.usdRate,
): string {
  return currency === 'USD' ? formatUsd(gsToUsd(gs, rate)) : formatGs(gs)
}

/** Monto de cada cuota, redondeado hacia abajo a la centena (como en los mockups). */
export function installmentAmount(price: number, count: number): number {
  return Math.floor(price / count / 100) * 100
}

/** "12 cuotas de Gs. 382.500" (o null si es pago único). */
export function formatInstallments(
  price: number,
  count: number,
  currency: Currency,
  rate: number = brand.currency.usdRate,
): string | null {
  if (count <= 1) return null
  return `${count} cuotas de ${formatPrice(installmentAmount(price, count), currency, rate)}`
}
