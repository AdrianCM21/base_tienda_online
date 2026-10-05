import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import * as XLSX from 'xlsx'

/** Entra al panel (con la sesión falsa) y abre `path`; el login siempre redirige al dashboard. */
async function enter(page: Page, path = '/admin') {
  await page.goto('/admin/login?demo=0')
  await page.getByRole('button', { name: 'Entrar como demo' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible()
  await page.goto(`${path}?demo=0`)
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

test('acceso falso, aviso de demo y navegación entre secciones', async ({ page }) => {
  await page.goto('/admin/productos?demo=0')
  await expect(page).toHaveURL(/\/admin\/login$/)
  await expect(page.getByRole('note')).toContainText('Modo demo')
  await page.getByRole('button', { name: 'Entrar como demo' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible()
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/)

  const nav = page.getByRole('navigation', { name: 'Panel administrador' })
  for (const group of ['Ventas', 'Catálogo', 'Marketing', 'Reportes', 'Tienda'])
    await expect(nav.locator('p', { hasText: group })).toBeVisible()
  for (const [link, heading] of [
    ['Productos', 'Productos'],
    ['Pedidos', 'Pedidos'],
    ['Clientes', 'Clientes'],
    ['Categorías', 'Categorías'],
    ['Inventario', 'Inventario'],
    ['Reportes', 'Reportes'],
    ['Apariencia', 'Apariencia'],
    ['Configuración', 'Configuración'],
    ['Inicio', 'Inicio'],
  ]) {
    await nav.getByRole('link', { name: link }).click()
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  }
  await nav.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('importador: la plantilla descargada se vuelve a subir, valida sin errores y se importa (simulado)', async ({
  page,
}) => {
  await enter(page, '/admin/productos/importar')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar plantilla' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('plantilla-productos.xlsx')
  // Playwright guarda la descarga con un nombre temporal sin extensión: se sube con su nombre real.
  const buffer = await readFile((await download.path())!)

  await page
    .getByLabel(/Arrastrá tu archivo/)
    .setInputFiles({ name: download.suggestedFilename(), mimeType: XLSX_MIME, buffer })
  await expect(page.getByText(/El archivo es válido: se pueden importar 2 productos/)).toBeVisible()
  await page.getByRole('tab', { name: 'Productos (2)' }).click()
  await expect(page.getByRole('cell', { name: 'TD-5001' })).toBeVisible()

  await page.getByRole('button', { name: 'Importar 2 productos' }).click()
  await expect(page.getByRole('heading', { name: '¡2 productos importados!' })).toBeVisible()
  await expect(page.getByText(/el catálogo de la demo no se modificó/)).toBeVisible()
})

test('importador: un archivo roto muestra cada error con hoja, fila y columna', async ({
  page,
}) => {
  await enter(page, '/admin/productos/importar')
  const header = [
    'sku',
    'nombre',
    'marca',
    'categoria',
    'subcategoria',
    'precio',
    'stock',
    'descripcion_corta',
    'descripcion',
    'imagen_principal',
  ]
  const ok = [
    'A-1',
    'Notebook de prueba 15"',
    'Acme',
    'Informática',
    'Notebooks',
    1000000,
    5,
    'Corta',
    'Una descripción suficientemente larga para esta prueba.',
    'placeholder',
  ]
  const bad = [
    'A-1',
    'abc',
    'Acme',
    'Inexistente',
    'Notebooks',
    'caro',
    5,
    'Corta',
    'Una descripción suficientemente larga para esta prueba.',
    'foto.pdf',
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header, ok, bad]), 'Productos')
  const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))

  await page.getByLabel(/Arrastrá tu archivo/).setInputFiles({
    name: 'roto.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  })
  await expect(page.getByText(/Hay \d+ errores\. Corregilos/)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Importar/ })).toBeDisabled()

  const panel = page.getByRole('tabpanel')
  // Cada error está ubicado: hoja "Productos", fila 3 del Excel y la columna con el problema.
  for (const column of ['sku', 'nombre', 'categoria', 'precio', 'imagen_principal']) {
    await expect(
      panel.getByRole('row', { name: new RegExp(`Error Productos 3 ${column}\\b`) }),
    ).toBeVisible()
  }

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar problemas (CSV)' }).click(),
  ])
  const csv = await readFile((await download.path())!, 'utf8')
  expect(csv).toContain('"Error","Productos","3","precio"')
})

test('inicio: el período cambia el gráfico y "Por hacer" abre la lista filtrada', async ({
  page,
}) => {
  await enter(page, '/admin')
  await expect(page.getByRole('img', { name: 'Ventas de los últimos 30 días' })).toBeVisible()
  await page.getByRole('radio', { name: '7 días' }).check({ force: true })
  await expect(page.getByRole('img', { name: 'Ventas de los últimos 7 días' })).toBeVisible()
  await page.getByRole('link', { name: /Productos sin stock/ }).click()
  await expect(page).toHaveURL(/\/admin\/inventario\?estado=agotado/)
  await expect(page.getByRole('button', { name: 'Agotados', pressed: true })).toBeVisible()
  for (const row of (await page.getByRole('row').all()).slice(1))
    await expect(row).toContainText('Agotado')
})

test('reportes: período, tabla diaria y exportación CSV', async ({ page }) => {
  await enter(page, '/admin/reportes')
  await expect(page.getByText(/Mostrando 1-10 de 30 días/)).toBeVisible()
  await page.getByRole('radio', { name: '14 días' }).check({ force: true })
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar CSV' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('ventas-por-dia-ultimos-14-dias.csv')
  expect(await readFile((await download.path())!, 'utf8')).toContain(
    '"Fecha","Pedidos","Ventas (Gs.)"',
  )
  await page.getByRole('tab', { name: 'Productos' }).click()
  await expect(page.getByRole('table', { name: 'Ranking de productos' })).toBeVisible()
  await page.getByRole('tab', { name: 'Categorías y pagos' }).click()
  await expect(page.getByRole('region', { name: 'Ventas por medio de pago' })).toBeVisible()
})

test('clientes: segmentos, detalle con historial y enlace al pedido', async ({ page }) => {
  await enter(page, '/admin/clientes')
  await page.getByRole('button', { name: /^VIP/ }).click()
  for (const row of (await page.getByRole('row').all()).slice(1))
    await expect(row).toContainText('VIP')
  await page.getByRole('row').nth(1).getByRole('button').first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Historial de pedidos' })).toBeVisible()
  await dialog.getByRole('link', { name: /^PED-/ }).first().click()
  await expect(page).toHaveURL(/\/admin\/pedidos\?pedido=PED-/)
  await expect(page.getByRole('dialog', { name: /^Pedido PED-/ })).toBeVisible()
})

test('inventario: el umbral cambia el stock bajo y se exporta a CSV', async ({ page }) => {
  await enter(page, '/admin/inventario')
  await page.getByRole('button', { name: 'Stock bajo' }).click()
  const count = async () =>
    Number((await page.getByText(/Mostrando/).innerText()).match(/de (\d+)/)![1])
  const at5 = await count()
  await page.getByLabel(/Avisar con menos de/).fill('30')
  expect(await count()).toBeGreaterThan(at5)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar CSV' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('inventario.csv')
})

test('buscador global: Ctrl+K encuentra un producto y lleva a su editor', async ({ page }) => {
  await enter(page, '/admin')
  await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible() // el atajo se registra al cargar el panel
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog', { name: 'Buscador del panel' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('combobox').fill('ideapad 3')
  await expect(dialog.getByRole('group', { name: 'Productos' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: /IdeaPad 3/ })).toBeVisible()
  await expect(dialog).toBeHidden()
})

test('cupones: crear uno nuevo con validación y pausarlo', async ({ page }) => {
  await enter(page, '/admin/marketing/cupones')
  await page.getByRole('button', { name: 'Nuevo cupón' }).click()
  const dialog = page.getByRole('dialog', { name: 'Nuevo cupón' })
  await dialog.getByRole('button', { name: 'Crear cupón' }).click()
  await expect(dialog.getByText(/entre 4 y 20 letras/)).toBeVisible()
  await dialog.getByLabel('Código').fill('verano20')
  await dialog.getByLabel('Hasta').fill('2026-12-31')
  await expect(dialog.getByText(/10% de descuento/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Crear cupón' }).click()
  const row = page.getByRole('row').filter({ hasText: 'VERANO20' })
  await expect(row).toBeVisible()
  await row.getByRole('switch', { name: /Pausar el cupón VERANO20/ }).click()
  await expect(row).toContainText('Pausado')
})

test('beneficios con bancos: ocultar uno cambia la vista previa de la Home', async ({ page }) => {
  await enter(page, '/admin/marketing/bancos')
  const preview = page.getByRole('region', { name: 'Beneficios con tu banco o cooperativa' })
  await expect(preview.getByRole('listitem')).toHaveCount(4)
  await page.getByRole('switch', { name: 'Mostrar Banco Sol en la tienda' }).click()
  await expect(preview.getByRole('listitem')).toHaveCount(3)
  await expect(preview.getByText('Banco Sol')).toHaveCount(0)
})

test('banners y destacados: el banner sigue lo que se escribe y los destacados se reordenan', async ({
  page,
}) => {
  await enter(page, '/admin/marketing/banners')
  await page.getByLabel('Título').fill('Ofertas de la semana')
  await expect(
    page
      .getByRole('region', { name: 'Vista previa del banner principal' })
      .getByText('Ofertas de la semana'),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Productos destacados' }).click()
  const items = page.getByRole('list', { name: 'Orden de los destacados' }).getByRole('listitem')
  await expect(items).toHaveCount(8)
  const first = (await items.first().locator('.font-semibold').innerText()).trim()
  await page.getByRole('button', { name: `Bajar ${first}` }).click()
  await expect(items.nth(1)).toContainText(first)
})

test('configuración: recorre las 5 pestañas', async ({ page }) => {
  await enter(page, '/admin/configuracion')
  await page.getByRole('tab', { name: 'Envíos' }).click()
  await expect(page.getByRole('table', { name: 'Zonas de envío' })).toBeVisible()
  await page.getByRole('tab', { name: 'Pagos' }).click()
  await page.getByRole('switch', { name: 'Aceptar tarjetas' }).click()
  await expect(page.getByLabel('Máximo de cuotas')).toHaveCount(0)
  await page.getByRole('tab', { name: 'Impuestos' }).click()
  await page.getByLabel('Tasa general').selectOption('5')
  await expect(page.getByText(/incluye Gs\. 5\.238 de IVA/)).toBeVisible()
  await page.getByRole('tab', { name: 'Usuarios y roles' }).click()
  await page.getByRole('button', { name: 'Invitar usuario' }).click()
  await page.getByRole('dialog').getByLabel('Email').fill('nueva@persona.com')
  await page.getByRole('dialog').getByRole('button', { name: 'Enviar invitación' }).click()
  await expect(
    page.getByRole('table', { name: 'Usuarios del panel' }).getByText('nueva@persona.com'),
  ).toBeVisible()
})

test('la guía de inicio avanza al visitar pantallas y se puede ocultar', async ({ page }) => {
  await enter(page, '/admin')
  const guide = page.getByRole('region', { name: 'Configurá tu tienda' })
  await expect(guide.getByText('1 de 6 pasos completados')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Panel administrador' })
    .getByRole('link', { name: 'Cupones' })
    .click()
  await expect(page.getByRole('heading', { level: 1, name: 'Cupones' })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Panel administrador' })
    .getByRole('link', { name: 'Inicio' })
    .click()
  await expect(guide.getByText('2 de 6 pasos completados')).toBeVisible()
  await page.getByRole('button', { name: 'Ocultar la guía de inicio' }).click()
  await expect(guide).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Configurá tu tienda' })).toHaveCount(0)
})

test('apariencia: un color propio con bajo contraste lo avisa', async ({ page }) => {
  await enter(page, '/admin/apariencia')
  await page.getByLabel('Color principal propio').fill('#ffe600')
  await expect(page.getByRole('main').getByRole('status')).toContainText('Contraste bajo')
  await page.getByRole('button', { name: 'Restablecer' }).click()
  await expect(page.getByRole('main').getByRole('status')).toContainText('Buen contraste')
})

test('la ruta anterior del importador sigue funcionando', async ({ page }) => {
  await enter(page, '/admin/importar')
  await expect(page).toHaveURL(/\/admin\/productos\/importar/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Importar productos desde XLSX' }),
  ).toBeVisible()
})

test('exportar el catálogo y volver a subirlo: todo queda "sin cambios"', async ({ page }) => {
  await enter(page, '/admin/productos')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar catálogo' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('catalogo-productos.xlsx')
  const buffer = await readFile((await download.path())!)

  await page.getByRole('link', { name: 'Importar' }).click()
  await page
    .getByLabel(/Arrastrá tu archivo/)
    .setInputFiles({ name: 'catalogo-productos.xlsx', mimeType: XLSX_MIME, buffer })
  await expect(
    page.getByText(/0 nuevos · 0 actualizados · 72 sin cambios · 0 omitidos/),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Importar 0 productos' })).toBeDisabled()
})

test('importar: los modos cambian lo que se aplicaría', async ({ page }) => {
  await enter(page, '/admin/productos/importar')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Descargar plantilla' }).click(),
  ])
  const buffer = await readFile((await download.path())!)
  await page
    .getByLabel(/Arrastrá tu archivo/)
    .setInputFiles({ name: 'plantilla.xlsx', mimeType: XLSX_MIME, buffer })
  await expect(page.getByText(/2 nuevos · 0 actualizados/)).toBeVisible()
  await page.getByRole('radio', { name: /Solo actualizar precios y stock/ }).check()
  await expect(
    page.getByText(/0 nuevos · 0 actualizados · 0 sin cambios · 2 omitidos/),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Importar 0 productos' })).toBeDisabled()
})

test('editor de producto: pestañas, edición en pantalla y aviso de demo al guardar', async ({
  page,
}) => {
  await enter(page, '/admin/productos')
  await page.getByRole('link', { name: /^Editar Notebook Lenovo IdeaPad 3/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: /IdeaPad 3/ })).toBeVisible()
  await page.getByLabel('Marca').fill('Marca editada')
  await expect(page.getByRole('region', { name: 'Cambios sin guardar' })).toBeVisible()

  await page.getByRole('tab', { name: 'Precios y ofertas' }).click()
  await expect(page.getByText(/Descuento de 12%/)).toBeVisible()
  await page.getByRole('tab', { name: 'Variantes' }).click()
  await page.getByRole('checkbox', { name: 'Talle' }).check()
  await page.getByRole('button', { name: 'M', pressed: false, exact: true }).click()
  await page.getByRole('tab', { name: 'SEO' }).click()
  await expect(page.getByText(/Cómo aparece en Google/)).toBeVisible()

  await page
    .getByRole('region', { name: 'Cambios sin guardar' })
    .getByRole('button', { name: 'Guardar cambios' })
    .click()
  await expect(page.getByText('Los cambios no se guardan: es una demostración')).toBeVisible()
  await page
    .getByRole('region', { name: 'Cambios sin guardar' })
    .getByRole('button', { name: 'Descartar' })
    .click()
  await page.getByRole('tab', { name: 'General' }).click()
  await expect(page.getByLabel('Marca')).toHaveValue('Lenovo')
})

test('pedidos: abrir, avanzar de estado, exportar CSV y WhatsApp', async ({ page }) => {
  await enter(page, '/admin/pedidos')
  await page.getByRole('button', { name: /^Pendiente de pago/ }).click()
  await page
    .getByRole('row')
    .nth(1)
    .getByRole('button', { name: /^Ver pedido / })
    .click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('link', { name: 'Escribir por WhatsApp' })).toHaveAttribute(
    'href',
    /wa\.me\/595/,
  )
  await dialog.getByRole('button', { name: /^Pasar a «Confirmado»/ }).click()
  await expect(
    dialog.getByRole('list', { name: 'Historial del pedido' }).getByRole('listitem'),
  ).toHaveCount(2)
  await dialog.getByRole('button', { name: 'Cancelar pedido' }).click()
  await expect(dialog.getByRole('button', { name: 'Reabrir pedido' })).toBeVisible()
  await page.keyboard.press('Escape')

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar CSV' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('pedidos.csv')
  expect(await readFile((await download.path())!, 'utf8')).toContain('"Pedido","Fecha","Cliente"')
})

test('la campanita avisa del pedido hecho en la tienda y abre su detalle', async ({ page }) => {
  await page.goto('/?demo=1')
  await page
    .getByRole('navigation', { name: 'Navegación de la demo' })
    .getByRole('button', { name: 'Confirmación' })
    .click()
  await enter(page, '/admin')
  await page.getByRole('button', { name: /^Avisos: 1 pedido nuevo/ }).click()
  await page.getByRole('link', { name: /Nuevo pedido PED-/ }).click()
  await expect(page.getByRole('dialog', { name: /^Pedido PED-/ })).toBeVisible()
})

test('apariencia: elegir una paleta recolorea la tienda', async ({ page }) => {
  await enter(page, '/admin/apariencia')
  await page.getByRole('radio', { name: 'Violeta' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'violeta')
  await page.goto('/?demo=0')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'violeta')
})

test('pedido hecho en la tienda aparece en Pedidos del admin', async ({ page }) => {
  await page.goto('/?demo=1')
  await page
    .getByRole('navigation', { name: 'Navegación de la demo' })
    .getByRole('button', { name: 'Confirmación' })
    .click()
  const id = (
    await page
      .getByText(/PED-\d{6}-[0-9A-Z]{4}/)
      .first()
      .innerText()
  ).match(/PED-\d{6}-[0-9A-Z]{4}/)![0]
  await enter(page, '/admin/pedidos')
  await expect(page.getByRole('row', { name: new RegExp(id) })).toContainText('TU PEDIDO')
})
