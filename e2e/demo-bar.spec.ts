import { expect, test } from '@playwright/test'

const bar = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Navegación de la demo' })

test('la barra salta entre pantallas y las prepara con datos de ejemplo', async ({ page }) => {
  await page.goto('/')
  await expect(bar(page)).toBeVisible()

  await bar(page).getByRole('button', { name: 'Checkout' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('heading', { name: '1. Datos de envío' })).toBeVisible()
  await expect(
    page.getByRole('complementary', { name: 'Resumen del pedido' }).getByRole('listitem'),
  ).toHaveCount(2)

  await bar(page).getByRole('button', { name: 'Confirmación' }).click()
  await expect(page).toHaveURL(/\/pedido\/PED-/)
  await expect(page.getByRole('heading', { level: 1, name: '¡Pedido confirmado!' })).toBeVisible()

  await bar(page).getByRole('link', { name: 'Admin' }).click()
  await expect(page).toHaveURL(/\/admin\/login$/)
  await expect(bar(page).getByRole('link', { name: 'Admin' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('cambiar la paleta desde la barra recolorea la tienda y se recuerda', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('header').first()
  const before = await header.evaluate((e) => getComputedStyle(e).backgroundColor)
  await page.getByRole('radio', { name: 'Paleta Verde' }).click()
  await expect
    .poll(() => header.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(before)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'verde')
})

test('ocultar (✕) persiste y se puede volver a mostrar', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ocultar barra de demo' }).click()
  await expect(bar(page)).toBeHidden()
  await page.reload()
  await expect(bar(page)).toBeHidden()
  await page.getByRole('button', { name: 'Mostrar barra de demo' }).click()
  await expect(bar(page)).toBeVisible()
})

test('?demo=0 la oculta en la sesión y ?demo=1 la restablece', async ({ page }) => {
  await page.goto('/?demo=0')
  await expect(bar(page)).toBeHidden()
  await page.goto('/carrito')
  await expect(bar(page)).toBeHidden()
  await page.goto('/?demo=1')
  await expect(bar(page)).toBeVisible()
})

test('"Reiniciar demo" pide confirmación y deja todo limpio', async ({ page }) => {
  await page.goto('/')
  await bar(page).getByRole('button', { name: 'Carrito' }).click() // llena el carrito
  await expect(page.getByRole('button', { name: /^Carrito, 2 productos/ })).toBeVisible()

  await page.getByRole('button', { name: /Reiniciar demo/ }).click()
  const dialog = page.getByRole('alertdialog', { name: '¿Reiniciar la demo?' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByRole('button', { name: /^Carrito, 2 productos/ })).toBeVisible()

  await page.getByRole('button', { name: /Reiniciar demo/ }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reiniciar' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('button', { name: /^Carrito, 0 productos/ })).toBeVisible()
})
