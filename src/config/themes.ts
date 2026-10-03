/** Paletas de la tienda. Cada tema define TODOS los tokens de color (ver themes.test.ts). */
export const THEME_TOKENS = [
  'primary',
  'primary-hover',
  'dark',
  'light',
  'bg',
  'text',
  'muted',
  'subtle',
  'on-dark',
  'on-dark-muted',
  'on-dark-link',
  'footer-copy',
  'hero-text',
] as const

export type ThemeToken = (typeof THEME_TOKENS)[number]

export type Theme = {
  id: string
  label: string
  colors: Record<ThemeToken, string>
}

export const themes = [
  {
    id: 'azul',
    label: 'Azul',
    colors: {
      primary: '#1D5FC1',
      'primary-hover': '#164A99',
      dark: '#0C2851',
      light: '#E4ECF8',
      bg: '#F4F8FC',
      text: '#101B2D',
      muted: '#3C5578',
      subtle: '#8A97AA',
      'on-dark': '#C9D9EF',
      'on-dark-muted': '#9FB4D6',
      'on-dark-link': '#9FC1EE',
      'footer-copy': '#8FA6C9',
      'hero-text': '#D6E4F7',
    },
  },
  {
    id: 'verde',
    label: 'Verde',
    colors: {
      primary: '#0E7A4B',
      'primary-hover': '#0A5E39',
      dark: '#0B3B2A',
      light: '#E2F3EA',
      bg: '#F3F9F6',
      text: '#0F2018',
      muted: '#3B5A4B',
      subtle: '#7A8F84',
      'on-dark': '#C6E6D5',
      'on-dark-muted': '#9CC7B0',
      'on-dark-link': '#9EE0BC',
      'footer-copy': '#8FBBA3',
      'hero-text': '#D3EEDF',
    },
  },
  {
    id: 'rojo',
    label: 'Rojo',
    colors: {
      primary: '#C62F3B',
      'primary-hover': '#9E232D',
      dark: '#4A0F16',
      light: '#FBE6E8',
      bg: '#FDF5F5',
      text: '#2A1012',
      muted: '#6B3F44',
      subtle: '#A08A8C',
      'on-dark': '#F1CDD0',
      'on-dark-muted': '#D9A3A8',
      'on-dark-link': '#FFB3B9',
      'footer-copy': '#C98F95',
      'hero-text': '#F8DADD',
    },
  },
  {
    id: 'violeta',
    label: 'Violeta',
    colors: {
      primary: '#6D3FC9',
      'primary-hover': '#5429A8',
      dark: '#2A1458',
      light: '#EDE6FA',
      bg: '#F8F5FD',
      text: '#1B1230',
      muted: '#504070',
      subtle: '#9A90AD',
      'on-dark': '#DDD0F5',
      'on-dark-muted': '#B8A5E0',
      'on-dark-link': '#C9B2FF',
      'footer-copy': '#A793D3',
      'hero-text': '#E6DCFA',
    },
  },
  {
    id: 'grafito',
    label: 'Grafito',
    colors: {
      primary: '#334155',
      'primary-hover': '#1E293B',
      dark: '#111827',
      light: '#E5E9EF',
      bg: '#F5F6F8',
      text: '#0F172A',
      muted: '#475569',
      subtle: '#94A3B8',
      'on-dark': '#D1D7E0',
      'on-dark-muted': '#A3ADBD',
      'on-dark-link': '#B8C7E0',
      'footer-copy': '#94A0B3',
      'hero-text': '#DCE2EB',
    },
  },
] as const satisfies readonly Theme[]

export type ThemeId = (typeof themes)[number]['id']

export const DEFAULT_THEME_ID: ThemeId = 'azul'

export function getTheme(id: string | null | undefined): Theme {
  return themes.find((t) => t.id === id) ?? themes[0]
}

/** Escribe los tokens del tema como variables CSS (`--color-*`) sobre `root`. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  for (const token of THEME_TOKENS) {
    root.style.setProperty(`--color-${token}`, theme.colors[token])
  }
  root.dataset.theme = theme.id
}
