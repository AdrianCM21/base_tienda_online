import { readFileSync } from 'node:fs'
import { themes } from '@/config/themes'
import { contrastRatio, mixWithWhite } from '@/utils/color'

const css = readFileSync('src/index.css', 'utf8')
const block = css.slice(css.indexOf('.admin-theme.admin-dark {'))
const token = (name: string) => {
  const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`falta --${name} en el modo oscuro`)
  return m[1]
}

describe('modo oscuro del admin: contraste AA', () => {
  const bg = token('color-bg')
  const surface = token('admin-surface')

  it.each(['color-text', 'color-muted', 'color-subtle'])(
    '%s se lee sobre fondo y tarjetas',
    (t) => {
      expect(contrastRatio(token(t), bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(token(t), surface)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each([
    ['emerald-700', 'emerald-50'],
    ['emerald-800', 'emerald-100'],
    ['red-700', 'red-50'],
    ['red-800', 'red-100'],
    ['amber-700', 'amber-50'],
    ['amber-800', 'amber-100'],
    ['amber-900', 'amber-100'],
    ['sky-800', 'sky-100'],
  ])('estado %s sobre %s', (fg, back) => {
    expect(contrastRatio(token(`color-${fg}`), token(`color-${back}`))).toBeGreaterThanOrEqual(4.5)
  })

  it.each(themes.map((t) => [t.id, t.colors.primary]))(
    'acento de la paleta %s (aclarado) con texto oscuro y sobre el fondo',
    (_id, primary) => {
      const accent = mixWithWhite(primary, 45)
      expect(contrastRatio(token('admin-on-primary'), accent)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(accent, surface)).toBeGreaterThanOrEqual(4.5)
    },
  )
})
