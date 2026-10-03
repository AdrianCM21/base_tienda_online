import {
  getAllProducts,
  getCategories,
  getFeatured,
  getProduct,
  getRelated,
  getSubcategories,
  queryProducts,
  resolveListing,
  searchSuggestions,
} from './catalogService'

describe('integridad de datos', () => {
  const products = getAllProducts()
  const cats = getCategories()
  const subSlugs = new Map(
    cats.flatMap((c) => getSubcategories(c).map((s) => [s.slug, c.slug] as const)),
  )

  it('tiene al menos 60 productos publicados', () => {
    expect(products.length).toBeGreaterThanOrEqual(60)
  })
  it('hay 10 categorías y slugs de subcategoría únicos', () => {
    expect(cats).toHaveLength(10)
    expect(subSlugs.size).toBe(cats.flatMap(getSubcategories).length)
  })
  it('slug y sku únicos', () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length)
    expect(new Set(products.map((p) => p.sku)).size).toBe(products.length)
  })
  it('cada producto referencia una subcategoría de su categoría', () => {
    for (const p of products) expect(subSlugs.get(p.subcategoryId), p.slug).toBe(p.categoryId)
  })
  it('precios, ofertas y cuotas coherentes', () => {
    for (const p of products) {
      expect(Number.isInteger(p.price) && p.price > 0, p.slug).toBe(true)
      if (p.oldPrice) expect(p.oldPrice, p.slug).toBeGreaterThan(p.price)
      expect(p.installments!.count).toBeGreaterThanOrEqual(1)
      expect(p.installments!.count).toBeLessThanOrEqual(18)
      expect(p.shortDescription.length).toBeLessThanOrEqual(160)
    }
  })
  it('variantes de color válidas y stock consistente', () => {
    for (const p of products) {
      for (const c of p.colors) expect(c.hex, p.slug).toMatch(/^#[0-9A-Fa-f]{6}$/)
      if (p.colors.length) expect(p.stock, p.slug).toBe(p.colors.reduce((s, c) => s + c.stock, 0))
    }
  })
  it('al menos 20 productos con 2+ colores y algún caso sin stock', () => {
    expect(products.filter((p) => p.colors.length > 1).length).toBeGreaterThanOrEqual(20)
    expect(products.some((p) => p.stock === 0)).toBe(true)
  })
  it('los filterSpecs existen como especificaciones en sus productos', () => {
    for (const c of cats)
      for (const s of getSubcategories(c))
        for (const key of s.filterSpecs ?? []) {
          const inSub = products.filter((p) => p.subcategoryId === s.slug)
          expect(
            inSub.some((p) => p.specs[key]),
            `${s.slug}:${key}`,
          ).toBe(true)
        }
  })
  it('los productos en borrador no se exponen', () => {
    expect(getProduct('rack-para-tv-hasta-65-con-puertas')).toBeUndefined()
  })
})

describe('resolveListing', () => {
  it('categoría, subcategoría y combinación', () => {
    expect(resolveListing('informatica')?.subcategory).toBeUndefined()
    expect(resolveListing('notebooks')).toMatchObject({
      category: { slug: 'informatica' },
      subcategory: { slug: 'notebooks' },
    })
    expect(resolveListing('informatica', 'monitores')?.subcategory?.slug).toBe('monitores')
    expect(resolveListing('electronica', 'monitores')).toBeUndefined()
    expect(resolveListing('nada')).toBeUndefined()
  })
})

describe('queryProducts', () => {
  it('lista Notebooks con los 9 del mockup en la primera página', () => {
    const r = queryProducts({ category: 'notebooks', sort: 'relevancia' })
    expect(r.pageSize).toBe(9)
    expect(r.items).toHaveLength(9)
    expect(r.total).toBeGreaterThanOrEqual(18)
    expect(r.scopeTotal).toBe(r.total)
    expect(r.facets.specs['Procesador']).toBeDefined()
    expect(r.facets.specs['Memoria RAM']).toBeDefined()
  })
  it('filtra por marca y suma bien los conteos de facetas', () => {
    const base = queryProducts({ category: 'notebooks' })
    const lenovo = queryProducts({ category: 'notebooks', filters: { brands: ['Lenovo'] } })
    expect(lenovo.total).toBe(base.facets.brands.find((b) => b.value === 'Lenovo')!.count)
    expect(lenovo.items.every((p) => p.brand === 'Lenovo')).toBe(true)
    expect(lenovo.scopeTotal).toBe(base.total)
  })
  it('ordena por precio', () => {
    const r = queryProducts({ category: 'notebooks', sort: 'menor-precio', pageSize: 100 })
    const prices = r.items.map((p) => p.price)
    expect(prices).toEqual([...prices].sort((x, y) => x - y))
  })
  it('pagina y ajusta páginas fuera de rango', () => {
    const r = queryProducts({ category: 'notebooks', page: 999 })
    expect(r.page).toBe(r.pageCount)
    expect(r.from).toBeGreaterThan(0)
  })
  it('búsqueda global sin categoría', () => {
    const r = queryProducts({ filters: { q: 'camara' } })
    expect(r.total).toBeGreaterThan(0)
    expect(r.items.every((p) => /c[aá]mara/i.test(p.name))).toBe(true)
  })
  it('sin resultados devuelve estructura vacía válida', () => {
    const r = queryProducts({ filters: { q: 'zzzz-no-existe' } })
    expect(r).toMatchObject({ total: 0, items: [], page: 1, pageCount: 1, from: 0, to: 0 })
  })
})

describe('otras consultas', () => {
  it('destacados: los 8 de la Home', () => {
    expect(getFeatured()).toHaveLength(8)
  })
  it('relacionados: 4, sin incluir el propio producto', () => {
    const p = getProduct('notebook-lenovo-ideapad-3-15-ryzen-5-8gb-256gb-ssd')!
    const rel = getRelated(p)
    expect(rel).toHaveLength(4)
    expect(rel.some((r) => r.id === p.id)).toBe(false)
  })
  it('sugerencias de búsqueda', () => {
    expect(searchSuggestions('')).toEqual([])
    expect(searchSuggestions('lenovo', 3).length).toBeLessThanOrEqual(3)
  })
})
