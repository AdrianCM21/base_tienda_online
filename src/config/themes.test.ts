import { readFileSync } from 'node:fs'
import { contrastRatio } from '@/utils/color'
import { applyTheme, getTheme, THEME_TOKENS, themes } from './themes'

describe('themes', () => {
  it.each(themes.map((t) => [t.id, t] as const))(
    '%s define todos los tokens con hex válido',
    (_id, t) => {
      for (const token of THEME_TOKENS) {
        expect(t.colors[token], token).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    },
  )

  it('los ids son únicos', () => {
    expect(new Set(themes.map((t) => t.id)).size).toBe(themes.length)
  })

  it.each(themes.map((t) => [t.id, t] as const))(
    '%s cumple contraste AA en pares críticos',
    (_id, t) => {
      const c = t.colors
      expect(contrastRatio(c.primary, '#FFFFFF'), 'blanco sobre primary').toBeGreaterThanOrEqual(
        4.5,
      )
      expect(contrastRatio(c.text, c.bg), 'text sobre bg').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(c.muted, '#FFFFFF'), 'muted sobre blanco').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(c['on-dark'], c.dark), 'on-dark sobre dark').toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(c['on-dark-muted'], c.dark),
        'on-dark-muted sobre dark',
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(c['footer-copy'], c.dark),
        'footer-copy sobre dark',
      ).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio('#FFFFFF', c.dark), 'blanco sobre dark').toBeGreaterThanOrEqual(7)
      expect(contrastRatio(c.subtle, '#FFFFFF'), 'subtle sobre blanco').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(c.subtle, c.bg), 'subtle sobre bg').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(c.primary, c.light), 'primary sobre light').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(c.primary, c.bg), 'primary sobre bg').toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(c.muted, c.light), 'muted sobre light').toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(c['on-dark-link'], c.dark),
        'on-dark-link sobre dark',
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrastRatio(c['hero-text'], c.primary),
        'hero-text sobre primary',
      ).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('los defaults de index.css coinciden con el tema azul', () => {
    const css = readFileSync('src/index.css', 'utf8').toLowerCase()
    for (const token of THEME_TOKENS) {
      expect(css, token).toContain(`--color-${token}: ${themes[0].colors[token].toLowerCase()};`)
    }
  })

  it('getTheme cae en el tema por defecto si el id no existe', () => {
    expect(getTheme('nope').id).toBe('azul')
    expect(getTheme(null).id).toBe('azul')
  })

  it('applyTheme sobre el documento actualiza theme-color', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
    applyTheme(getTheme('rojo'))
    expect(meta.content).toBe(getTheme('rojo').colors.dark)
    meta.remove()
  })

  it('applyTheme escribe variables CSS y data-theme', () => {
    const root = document.createElement('div')
    applyTheme(getTheme('verde'), root)
    expect(root.style.getPropertyValue('--color-primary')).toBe(getTheme('verde').colors.primary)
    expect(root.style.getPropertyValue('--brand-primary')).toBe(getTheme('verde').colors.primary)
    expect(root.dataset.theme).toBe('verde')
  })
})
