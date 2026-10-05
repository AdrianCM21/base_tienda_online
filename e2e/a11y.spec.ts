import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const THEMES = ['azul', 'verde', 'rojo', 'violeta', 'grafito']

const ROUTES: [string, string][] = [
  ['Home', '/'],
  ['Categoría', '/categoria/notebooks'],
  ['Producto', '/producto/notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd'],
  ['Producto sin stock', '/producto/joystick-inalambrico-para-consola'],
  ['Carrito', '/carrito'],
  ['Checkout', '/checkout'],
  ['Admin: dashboard', '/admin'],
  ['Admin: productos', '/admin/productos'],
  ['Admin: editor de producto', '/admin/productos/p001'],
  ['Admin: nuevo producto', '/admin/productos/nuevo'],
  ['Admin: importar', '/admin/productos/importar'],
  ['Admin: pedidos', '/admin/pedidos'],
  ['Admin: clientes', '/admin/clientes'],
  ['Admin: inventario', '/admin/inventario'],
  ['Admin: reportes', '/admin/reportes'],
  ['Admin: cupones', '/admin/marketing/cupones'],
  ['Admin: beneficios con bancos', '/admin/marketing/bancos'],
  ['Admin: banners y destacados', '/admin/marketing/banners'],
  ['Admin: categorías', '/admin/categorias'],
  ['Admin: apariencia', '/admin/apariencia'],
  ['Admin: configuración', '/admin/configuracion'],
]

type Axe = {
  run: (
    ctx: Document,
    opts: unknown,
  ) => Promise<{
    violations: {
      id: string
      help: string
      nodes: { target: string[]; failureSummary?: string }[]
    }[]
  }>
}

async function violations(page: Page): Promise<string[]> {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const results = await page.evaluate(() =>
    (window as unknown as { axe: Axe }).axe.run(document, {
      rules: { region: { enabled: false } },
    }),
  )
  return results.violations.map(
    (v) =>
      `${v.id}: ${v.help} → ${v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(' '))
        .join(' | ')}`,
  )
}

// Con navegador real sí se mide el contraste de color: se recorre cada pantalla en cada paleta.
for (const theme of THEMES) {
  test.describe(`paleta ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem('tienda-demo:theme', JSON.stringify(t))
        localStorage.setItem('tienda-demo:admin-session', 'true')
        localStorage.setItem(
          'tienda-demo:cart',
          JSON.stringify([{ productId: 'p001', colorName: 'Azul Abismo', quantity: 1 }]),
        )
      }, theme)
    })

    test('Admin: cada pestaña del editor de producto cumple axe', async ({ page }) => {
      await page.goto('/admin/productos/p001')
      for (const tab of [
        'General',
        'Precios y ofertas',
        'Inventario',
        'Variantes',
        'Imágenes',
        'Especificaciones',
        'SEO',
      ]) {
        await page.getByRole('tab', { name: tab }).click()
        expect(await violations(page), `pestaña ${tab}`).toEqual([])
      }
    })

    test('Admin: configuración (cada pestaña) cumple axe', async ({ page }) => {
      await page.goto('/admin/configuracion')
      for (const tab of ['General', 'Envíos', 'Pagos', 'Impuestos', 'Usuarios y roles']) {
        await page.getByRole('tab', { name: tab }).click()
        expect(await violations(page), `pestaña ${tab}`).toEqual([])
      }
    })

    test('Admin: buscador global abierto y formularios laterales cumplen axe', async ({ page }) => {
      await page.goto('/admin')
      await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible() // el atajo se registra al cargar el panel
      await page.keyboard.press('Control+k')
      await page.getByRole('combobox', { name: 'Buscar en el panel' }).fill('lenovo')
      await expect(page.getByRole('option').first()).toBeVisible()
      expect(await violations(page), 'buscador').toEqual([])
      await page.keyboard.press('Escape')

      await page.goto('/admin/marketing/cupones')
      await page.getByRole('button', { name: 'Nuevo cupón' }).click()
      await page.getByRole('button', { name: 'Crear cupón' }).click()
      expect(await violations(page), 'cupón con errores').toEqual([])
    })

    test('Admin: apariencia con color propio de bajo contraste cumple axe', async ({ page }) => {
      await page.goto('/admin/apariencia')
      await page.getByLabel('Color principal propio').fill('#ffe600')
      expect(await violations(page)).toEqual([])
    })

    test('Admin: reportes (cada pestaña) cumple axe', async ({ page }) => {
      await page.goto('/admin/reportes')
      for (const tab of ['Ventas', 'Productos', 'Categorías y pagos']) {
        await page.getByRole('tab', { name: tab }).click()
        expect(await violations(page), `pestaña ${tab}`).toEqual([])
      }
    })

    test('Admin: detalle de un cliente abierto cumple axe', async ({ page }) => {
      await page.goto('/admin/clientes')
      await page.getByRole('row').nth(1).getByRole('button').first().click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(await violations(page)).toEqual([])
    })

    test('Admin: detalle de un pedido abierto cumple axe', async ({ page }) => {
      await page.goto('/admin/pedidos')
      await page
        .getByRole('row')
        .nth(1)
        .getByRole('button', { name: /^Ver pedido / })
        .click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(await violations(page)).toEqual([])
    })

    test('Admin: vista previa del importador cumple axe', async ({ page }) => {
      await page.goto('/admin/productos/importar')
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: 'Descargar plantilla' }).click(),
      ])
      const buffer = await readFile((await download.path())!)
      await page.getByLabel(/Arrastrá tu archivo/).setInputFiles({
        name: 'plantilla.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer,
      })
      await expect(page.getByText(/El archivo es válido/)).toBeVisible()
      expect(await violations(page)).toEqual([])
    })

    for (const [name, path] of ROUTES) {
      test(`${name} cumple axe (incluye contraste)`, async ({ page }) => {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeAttached()
        await page.waitForLoadState('networkidle')
        expect(await violations(page)).toEqual([])
      })
    }
  })
}
