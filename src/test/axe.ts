import axe from 'axe-core'

/**
 * Corre axe-core sobre el DOM renderizado y devuelve un resumen legible de las violaciones.
 * El contraste de color no se puede medir en jsdom: se cubre en themes.test.ts y en el navegador.
 */
export async function a11yViolations(container: Element = document.body): Promise<string[]> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  return results.violations.map(
    (v) =>
      `${v.id}: ${v.help} → ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 3)
        .join(' | ')}`,
  )
}
