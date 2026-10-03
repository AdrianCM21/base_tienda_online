import { buildCatalogParams, parseCatalogParams } from './catalogParams'
import { clearFilters, filterChips } from './filterChips'

const parse = (qs: string) => parseCatalogParams(new URLSearchParams(qs))

describe('parseCatalogParams', () => {
  it('sin parámetros: valores por defecto', () => {
    expect(parse('')).toEqual({ filters: {}, sort: 'relevancia', page: 1 })
  })
  it('lee todos los filtros', () => {
    const s = parse(
      'q=lenovo&marca=HP&marca=Dell&color=Negro&precio=1000-5000&ofertas=1&f.Memoria%20RAM=8%20GB&orden=menor-precio&pagina=3',
    )
    expect(s).toEqual({
      filters: {
        q: 'lenovo',
        brands: ['HP', 'Dell'],
        colors: ['Negro'],
        priceMin: 1000,
        priceMax: 5000,
        onlyOffer: true,
        specs: { 'Memoria RAM': ['8 GB'] },
      },
      sort: 'menor-precio',
      page: 3,
    })
  })
  it('precio con un solo extremo', () => {
    expect(parse('precio=-5000').filters).toEqual({ priceMax: 5000 })
    expect(parse('precio=2000-').filters).toEqual({ priceMin: 2000 })
  })
  it('ignora valores inválidos', () => {
    expect(parse('orden=raro&pagina=-2&precio=abc&marca=%20&ofertas=0')).toEqual({
      filters: {},
      sort: 'relevancia',
      page: 1,
    })
  })
  it('deduplica valores repetidos', () => {
    expect(parse('marca=HP&marca=HP').filters.brands).toEqual(['HP'])
  })
})

describe('buildCatalogParams', () => {
  it('omite los valores por defecto', () => {
    expect(buildCatalogParams({ filters: {}, sort: 'relevancia', page: 1 }).toString()).toBe('')
  })
  it('es inverso de parse (ida y vuelta)', () => {
    const state = {
      filters: {
        q: 'tele',
        brands: ['LG'],
        colors: ['Negro'],
        priceMin: 10,
        priceMax: 20,
        onlyOffer: true,
        specs: { Resolución: ['4K UHD'] },
      },
      sort: 'nuevos' as const,
      page: 2,
    }
    expect(parseCatalogParams(buildCatalogParams(state))).toEqual(state)
  })
})

describe('filterChips', () => {
  const f = {
    q: 'x',
    brands: ['HP', 'Dell'],
    priceMin: 1000,
    specs: { RAM: ['8 GB'] },
    onlyOffer: true,
  }
  it('genera un chip por valor y permite quitarlo', () => {
    const chips = filterChips(f)
    expect(chips.map((c) => c.label)).toEqual([
      'HP',
      'Dell',
      '8 GB',
      'Desde Gs. 1.000',
      'En oferta',
    ])
    expect(chips[0].without.brands).toEqual(['Dell'])
    expect(chips[3].without).toMatchObject({ priceMin: undefined, priceMax: undefined })
  })
  it('clearFilters conserva solo la búsqueda', () => {
    expect(clearFilters(f)).toEqual({ q: 'x' })
    expect(clearFilters({ brands: ['a'] })).toEqual({})
  })
})
