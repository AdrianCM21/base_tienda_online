import { getAllProductsIncludingDrafts, getCategories } from '@/services/catalogService'
import { toDraft, discountPercent, blankDraft } from '../productDraft'
import { buildCatalogExport } from './export'
import { parseWorkbook } from './parse'
import { planImport } from './plan'
import { validateWorkbook } from './validate'

const products = getAllProductsIncludingDrafts()
const categories = getCategories()

describe('exportar el catálogo', () => {
  it(
    'el archivo exportado se vuelve a subir sin errores y con todos los productos',
    { timeout: 30_000 },
    async () => {
      const wb = await parseWorkbook(await buildCatalogExport(products, categories))
      const r = validateWorkbook(wb, categories)
      expect(r.issues.filter((i) => i.severity === 'error')).toEqual([])
      expect(r.counts.products).toBe(products.length)
      expect(r.counts.variants).toBe(products.reduce((n, p) => n + p.colors.length, 0))
      expect(r.counts.specs).toBe(products.reduce((n, p) => n + Object.keys(p.specs).length, 0))
      const lenovo = r.products.find((p) => p.sku === 'TD-4021')!
      expect(lenovo).toMatchObject({
        price: 4590000,
        oldPrice: 5190000,
        subcategoryId: 'notebooks',
        installments: { count: 12, interestFree: true },
      })
      expect(lenovo.colors.map((c) => c.name)).toEqual(products[0].colors.map((c) => c.name))
    },
  )

  it(
    'al reimportarlo sobre el mismo catálogo todo queda "sin cambios"',
    { timeout: 30_000 },
    async () => {
      const wb = await parseWorkbook(await buildCatalogExport(products, categories))
      const plan = planImport(validateWorkbook(wb, categories).products, products, 'upsert')
      expect(plan.counts).toMatchObject({
        nuevo: 0,
        actualizado: 0,
        omitido: 0,
        sinCambios: products.length,
        applied: 0,
      })
    },
  )
})

describe('planImport', () => {
  const base = products[0]
  const changed = { ...base, price: base.price + 1000, stock: base.stock + 5, name: 'Otro nombre' }
  const fresh = { ...base, sku: 'NUEVO-1' }

  it('upsert: nuevos, actualizados con el detalle de cambios y sin cambios', () => {
    const plan = planImport([fresh, changed, products[1]], products, 'upsert')
    expect(plan.items.map((i) => i.action)).toEqual(['nuevo', 'actualizado', 'sin-cambios'])
    expect(plan.items[1].changes).toEqual(['nombre', 'precio', 'stock'])
    expect(plan.counts).toMatchObject({ nuevo: 1, actualizado: 1, sinCambios: 1, applied: 2 })
  })
  it('create: omite los SKU existentes', () => {
    const plan = planImport([fresh, changed], products, 'create')
    expect(plan.items.map((i) => i.action)).toEqual(['nuevo', 'omitido'])
  })
  it('update-stock-price: solo mira precio, precio anterior y stock, y omite los nuevos', () => {
    const plan = planImport(
      [fresh, changed, { ...products[1], name: 'solo cambia el nombre' }],
      products,
      'update-stock-price',
    )
    expect(plan.items.map((i) => i.action)).toEqual(['omitido', 'actualizado', 'sin-cambios'])
    expect(plan.items[1].changes).toEqual(['precio', 'stock'])
  })
})

describe('productDraft', () => {
  it('toDraft refleja el producto', () => {
    const d = toDraft(products[0])
    expect(d).toMatchObject({
      sku: 'TD-4021',
      price: '4590000',
      oldPrice: '5190000',
      installments: '12',
      hasVariants: true,
    })
    expect(d.colors).toHaveLength(3)
    expect(d.specs.length).toBeGreaterThan(3)
    expect(new Set(d.colors.map((c) => c.id)).size).toBe(3)
  })
  it('blankDraft es un borrador vacío', () => {
    expect(blankDraft()).toMatchObject({
      status: 'borrador',
      name: '',
      unit: 'Unidad',
      hasVariants: false,
    })
  })
  it('discountPercent', () => {
    expect(discountPercent('4590000', '5190000')).toBe(12)
    expect(discountPercent('100', '')).toBe(0)
    expect(discountPercent('200', '100')).toBe(0)
  })
})
