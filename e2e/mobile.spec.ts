import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })

test('el botón junto al logo abre las categorías y navega', async ({ page }) => {
  await page.goto('/?demo=0')
  await expect(page.getByRole('complementary', { name: 'Categorías' })).toBeHidden()
  await page.getByRole('button', { name: 'Abrir menú de categorías' }).click()
  const menu = page.getByRole('dialog', { name: 'Categorías' })
  await expect(menu).toBeVisible()
  await menu.getByRole('link', { name: 'Monitores' }).click()
  await expect(page).toHaveURL(/\/categoria\/monitores$/)
  await expect(menu).toBeHidden()
})

test('en un listado los filtros viven en un panel', async ({ page }) => {
  await page.goto('/categoria/notebooks?demo=0')
  await expect(page.getByRole('complementary', { name: 'Filtros' })).toBeHidden()
  await page.getByRole('button', { name: /^Filtros/ }).click()
  const panel = page.getByRole('dialog', { name: 'Filtros' })
  await panel.getByRole('checkbox', { name: /^HP/ }).check()
  await panel.getByRole('button', { name: 'Aplicar filtros' }).click()
  await expect(panel).toBeHidden()
  await expect(page).toHaveURL(/marca=HP/)
  await expect(page.getByRole('button', { name: 'Filtros (1)' })).toBeVisible()
})

test('ninguna pantalla desborda horizontalmente', async ({ page }) => {
  await page.goto('/?demo=1')
  await page.evaluate(() => localStorage.setItem('tienda-demo:admin-session', 'true'))
  await page
    .getByRole('navigation', { name: 'Navegación de la demo' })
    .getByRole('button', { name: 'Carrito' })
    .click()
  for (const path of [
    '/',
    '/categoria/notebooks',
    '/buscar?q=lenovo',
    '/producto/notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd',
    '/carrito',
    '/checkout',
    '/admin',
    '/admin/productos',
    '/admin/productos/p001',
    '/admin/productos/importar',
    '/admin/pedidos',
    '/admin/clientes',
    '/admin/inventario',
    '/admin/reportes',
    '/admin/marketing/cupones',
    '/admin/marketing/bancos',
    '/admin/marketing/banners',
    '/admin/apariencia',
    '/admin/categorias',
    '/admin/configuracion',
    '/no-existe',
  ]) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `desborde en ${path}`).toBeLessThanOrEqual(0)
  }
})
