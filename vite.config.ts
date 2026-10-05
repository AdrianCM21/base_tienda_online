import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { brand } from './src/config/brand.ts'

// El nombre de la marca vive solo en src/config/brand.ts; aquí se inyecta en index.html.
const brandHtml = () => ({
  name: 'brand-html',
  transformIndexHtml: (html: string) =>
    html
      .replaceAll('__BRAND_NAME__', brand.name)
      .replaceAll('__BRAND_DESCRIPTION__', `${brand.name} — ${brand.tagline}`),
})

export default defineConfig({
  plugins: [react(), tailwindcss(), brandHtml()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
