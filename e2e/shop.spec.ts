import { expect, test } from '@playwright/test'

// Sin barra de demo para que el recorrido sea el de un cliente real.
test.beforeEach(async ({ page }) => {
  await page.goto('/?demo=0')
})

test('la Home carga con la marca y sin errores de consola', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/?demo=0')
  await expect(page.getByRole('heading', { level: 1, name: /18 cuotas/ })).toBeVisible()
  await expect(page).toHaveTitle('Tienda Demo')
  expect(errors).toEqual([])
})

test('compra completa: Home → categoría → filtro → producto → color → carrito → checkout → confirmación', async ({
  page,
}) => {
  // Categoría desde el menú "Categorías" del encabezado
  await page.getByRole('button', { name: 'Categorías' }).click()
  await page
    .getByRole('navigation', { name: 'Todas las categorías' })
    .getByRole('link', { name: 'Notebooks', exact: true })
    .click()
  await expect(page).toHaveURL(/\/categoria\/notebooks$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Notebooks' })).toBeVisible()
  await expect(page.getByText(/Mostrando 1-9 de 19 resultados/)).toBeVisible()

  // Filtro por marca (se aplica con el botón y queda en la URL)
  const filters = page.getByRole('complementary', { name: 'Filtros' })
  await filters.getByRole('checkbox', { name: /^Lenovo/ }).check()
  await filters.getByRole('button', { name: 'Aplicar filtros' }).click()
  await expect(page).toHaveURL(/marca=Lenovo/)
  for (const brand of await page.locator('article span.uppercase').allInnerTexts())
    expect(brand.toLowerCase()).toBe('lenovo')

  // Producto → color
  await page
    .getByRole('link', { name: /IdeaPad 3 15" Ryzen 5/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('IdeaPad 3')
  await page.getByRole('button', { name: 'Color Negro' }).click()
  await expect(page).toHaveURL(/color=Negro/)
  await expect(page.getByText(/SKU TD-\d+-NEG/)).toBeVisible()

  // Moneda
  await page.getByRole('radio', { name: 'USD' }).click()
  await expect(page.getByText(/^USD 628,77$/)).toBeVisible()
  await page.getByRole('radio', { name: 'Gs' }).click()

  // Carrito
  await page.getByRole('button', { name: 'Agregar al carrito' }).first().click()
  await page.getByRole('button', { name: /^Carrito, 1 producto/ }).click()
  const mini = page.getByRole('dialog', { name: /Tu carrito/ })
  await expect(mini.getByText('Gs. 4.590.000').first()).toBeVisible()
  await mini.getByRole('link', { name: 'Finalizar compra' }).click()

  // Checkout paso 1
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled()
  await page.getByLabel('Nombre y apellido').fill('María Fernández')
  await page.getByLabel('Teléfono').fill('0981 234 567')
  await page.getByLabel('Dirección').fill('Mcal. López 1234')
  await page.getByLabel('Ciudad').fill('Asunción')
  await page.getByLabel('Departamento').selectOption('Central')
  await page.getByLabel('Código postal').fill('1209')
  await page.getByRole('button', { name: 'Continuar al pago' }).click()

  // Paso 2: tarjeta de prueba
  await expect(page.getByText(/María Fernández — Mcal. López 1234, Asunción/)).toBeVisible()
  await page.getByLabel('Número de tarjeta').fill('4242424242424242')
  await expect(page.getByLabel('Número de tarjeta')).toHaveValue('4242 4242 4242 4242')
  await page.getByLabel('Nombre en la tarjeta').fill('MARIA FERNANDEZ')
  await page.getByLabel('Vencimiento').fill('1230')
  await page.getByLabel('CVV').fill('123')
  await page.getByRole('checkbox', { name: /Acepto los términos/ }).check()
  await page.getByRole('button', { name: 'Confirmar pedido' }).click()

  // Confirmación: número de pedido, aviso de demo y carrito vacío
  await expect(page.getByRole('heading', { level: 1, name: '¡Pedido confirmado!' })).toBeVisible()
  await expect(page.getByText(/PED-\d{6}-[0-9A-Z]{4}/).first()).toBeVisible()
  await expect(page.getByText(/no se realizó ningún cobro/)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Carrito, 0 productos/ })).toBeVisible()

  // El pedido sobrevive a una recarga (queda guardado en el navegador)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: '¡Pedido confirmado!' })).toBeVisible()
})

test('búsqueda con sugerencias y orden por precio', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Buscar productos' }).fill('lenovo')
  await expect(page.getByRole('option').first()).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/buscar\?q=lenovo/)
  await page.getByLabel('Ordenar por:').selectOption('menor-precio')
  await expect(page).toHaveURL(/orden=menor-precio/)
  const prices = (await page.locator('article span.font-bold.text-primary').allInnerTexts()).map(
    (t) => Number(t.replace(/\D/g, '')),
  )
  expect(prices.length).toBeGreaterThan(1)
  expect(prices).toEqual([...prices].sort((a, b) => a - b))
})

test('el carrito persiste al recargar', async ({ page }) => {
  await page.goto('/producto/mochila-porta-notebook-15-6?demo=0')
  await page.getByRole('button', { name: 'Agregar al carrito' }).first().click()
  await page.reload()
  await expect(page.getByRole('button', { name: /^Carrito, 1 producto/ })).toBeVisible()
})

test('una ruta inexistente muestra la 404 y permite volver', async ({ page }) => {
  await page.goto('/esto-no-existe')
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible()
  await page.getByRole('link', { name: 'Volver al inicio' }).click()
  await expect(page).toHaveURL(/\/$/)
})
