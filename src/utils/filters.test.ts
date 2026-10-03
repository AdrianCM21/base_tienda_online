import { computeFacets, filterProducts, matchesQuery } from './filters'
import { makeProduct as mk } from './testProducts'

const a = mk({
  id: 'a',
  name: 'Notebook Lenovo IdeaPad',
  brand: 'Lenovo',
  price: 4000,
  specs: { RAM: '8 GB', CPU: 'i5' },
  colors: [{ name: 'Negro', hex: '#000000', stock: 1 }],
})
const b = mk({
  id: 'b',
  name: 'Notebook HP 250',
  brand: 'HP',
  price: 3000,
  specs: { RAM: '8 GB', CPU: 'i3' },
  colors: [
    { name: 'Negro', hex: '#000000', stock: 1 },
    { name: 'Plata', hex: '#C0C0C0', stock: 0 },
  ],
})
const c = mk({
  id: 'c',
  name: 'Cámara Canon',
  brand: 'Canon',
  price: 9000,
  oldPrice: 10000,
  stock: 0,
  specs: { RAM: '16 GB' },
})
const all = [a, b, c]
const ids = (l: typeof all) => l.map((p) => p.id)

describe('matchesQuery', () => {
  it('ignora tildes y mayúsculas, exige todas las palabras', () => {
    expect(matchesQuery(c, 'CAMARA canon')).toBe(true)
    expect(matchesQuery(c, 'camara lenovo')).toBe(false)
    expect(matchesQuery(c, '')).toBe(true)
  })
})

describe('filterProducts', () => {
  it('por marca, precio, color, spec, oferta y stock', () => {
    expect(ids(filterProducts(all, { brands: ['HP', 'Canon'] }))).toEqual(['b', 'c'])
    expect(ids(filterProducts(all, { priceMin: 3500, priceMax: 9000 }))).toEqual(['a', 'c'])
    expect(ids(filterProducts(all, { colors: ['Plata'] }))).toEqual(['b'])
    expect(ids(filterProducts(all, { specs: { RAM: ['8 GB'] } }))).toEqual(['a', 'b'])
    expect(ids(filterProducts(all, { specs: { RAM: ['8 GB'], CPU: ['i3'] } }))).toEqual(['b'])
    expect(ids(filterProducts(all, { onlyOffer: true }))).toEqual(['c'])
    expect(ids(filterProducts(all, { inStock: true }))).toEqual(['a', 'b'])
  })
  it('sin filtros devuelve todo; valores vacíos no filtran', () => {
    expect(filterProducts(all)).toHaveLength(3)
    expect(filterProducts(all, { brands: [], specs: { RAM: [] } })).toHaveLength(3)
  })
})

describe('computeFacets', () => {
  it('cuenta aplicando los demás filtros pero no el propio grupo', () => {
    const f = computeFacets(all, { brands: ['HP'], specs: { RAM: ['8 GB'] } }, ['RAM', 'CPU'])
    // marcas: se ignora el filtro de marca, se respeta RAM=8GB
    expect(f.brands).toEqual([
      { value: 'HP', count: 1 },
      { value: 'Lenovo', count: 1 },
    ])
    // RAM: se ignora su propio filtro, se respeta marca=HP
    expect(f.specs.RAM).toEqual([{ value: '8 GB', count: 1 }])
    // CPU: respeta marca=HP y RAM
    expect(f.specs.CPU).toEqual([{ value: 'i3', count: 1 }])
  })
  it('mantiene seleccionados con conteo 0', () => {
    const f = computeFacets(all, { brands: ['Dell'] })
    expect(f.brands).toContainEqual({ value: 'Dell', count: 0 })
  })
  it('colores con hex y rango de precio', () => {
    const f = computeFacets(all)
    expect(f.colors.find((x) => x.value === 'Negro')).toMatchObject({ count: 2, hex: '#000000' })
    expect(f.priceRange).toEqual({ min: 3000, max: 9000 })
  })
  it('rango vacío si no hay productos', () => {
    expect(computeFacets([]).priceRange).toEqual({ min: 0, max: 0 })
  })
})
