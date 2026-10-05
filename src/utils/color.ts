function channel(v: number): number {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  )
}

/** Relación de contraste WCAG entre dos colores `#RRGGBB`. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Mensaje sobre el contraste del texto blanco (botones, etiquetas) con un color de fondo elegido. */
export function describeContrast(hex: string): { ok: boolean; text: string } {
  const ratio = contrastRatio('#FFFFFF', hex)
  const value = `${ratio.toFixed(1)}:1`
  return ratio >= 4.5
    ? { ok: true, text: `Buen contraste con el texto blanco (${value}).` }
    : {
        ok: false,
        text: `Contraste bajo (${value}): el texto blanco de los botones costará leerse. Probá con un tono más oscuro.`,
      }
}
