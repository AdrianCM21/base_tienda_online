/** Validación simple de email (formato, no existencia). */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/** Teléfono: entre 9 y 13 dígitos (ej. 0981 234 567 o +595 981 234 567). */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 13
}

/** Algoritmo de Luhn para números de tarjeta (solo dígitos). */
export function passesLuhn(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (double) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    double = !double
  }
  return sum % 10 === 0
}

/** "MM/AA" válido y no vencido (la tarjeta vale hasta el fin del mes indicado). */
export function isValidExpiry(value: string, now: Date = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!m) return false
  const month = Number(m[1])
  const year = 2000 + Number(m[2])
  if (month < 1 || month > 12) return false
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

export const isValidCvv = (value: string): boolean => /^\d{3,4}$/.test(value)

/** "4242424242424242" → "4242 4242 4242 4242" (acepta cualquier entrada, máx. 19 dígitos). */
export function formatCardNumber(value: string): string {
  return (
    value
      .replace(/\D/g, '')
      .slice(0, 19)
      .match(/.{1,4}/g)
      ?.join(' ') ?? ''
  )
}

/** "1228" → "12/28" */
export function formatExpiry(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}
