import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
// E2E_BASE_URL apunta las pruebas a un sitio ya desplegado (contenedor, Vercel, Netlify…) sin levantar servidor.
const REMOTE = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  // En local se corre de a una prueba para cuidar la memoria (cada una abre un Chrome); en CI usa todos los núcleos.
  workers: process.env.CI ? undefined : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: REMOTE ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // E2E_CHANNEL=chrome usa el Chrome instalado en el sistema en lugar del Chromium de Playwright.
    channel: process.env.E2E_CHANNEL || undefined,
    locale: 'es-PY',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.E2E_CHANNEL || undefined },
    },
  ],
  // Se prueba el build de producción (lo que se despliega), no el servidor de desarrollo.
  webServer: REMOTE
    ? undefined
    : {
        command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
