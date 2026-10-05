import { getAllProductsIncludingDrafts } from '@/services/catalogService'
import { applyBulk, applyEdits, countEdits, parsePercent, priceWithPercent } from './bulkProducts'
import { makeProduct as mk } from './testProducts'

const products = [
  mk({ id: 'a', price: 1000, oldPrice: 1200 }),
  mk({ id: 'b', price: 5000 }),
  mk({ id: 'c', price: 250, status: 'borrador' }),
]

describe('priceWithPercent', () => {
  it('aplica el porcentaje y redondea a la centena, con piso en Gs. 100', () => {
    expect(priceWithPercent(1_000_000, 10)).toBe(1_100_000)
    expect(priceWithPercent(4_590_000, -15)).toBe(3_901_500)
    expect(priceWithPercent(1_234, 10)).toBe(1_400) // 1357,4 → 1400
    expect(priceWithPercent(150, -90)).toBe(100)
  })
})

describe('parsePercent', () => {
  it('acepta enteros con signo entre -90 y 200 y rechaza lo demás', () => {
    expect(parsePercent('15')).toEqual({ ok: true, value: 15 })
    expect(parsePercent('-20')).toEqual({ ok: true, value: -20 })
    expect(parsePercent('+5')).toEqual({ ok: true, value: 5 })
    for (const bad of ['', 'abc', '1.5', '0', '-95', '250'])
      expect(parsePercent(bad).ok, bad).toBe(false)
  })
})

describe('applyBulk / applyEdits', () => {
  it('cambia el estado, el precio y elimina, sin mutar las ediciones anteriores', () => {
    const e0 = {}
    const e1 = applyBulk(e0, ['a', 'c'], { kind: 'status', status: 'activo' }, products)
    expect(e0).toEqual({})
    expect(e1).toEqual({ a: { status: 'activo' }, c: { status: 'activo' } })
    const e2 = applyBulk(e1, ['b'], { kind: 'remove' }, products)
    const out = applyEdits(products, e2)
    expect(out.map((p) => p.id)).toEqual(['a', 'c'])
    expect(out.find((p) => p.id === 'c')!.status).toBe('activo')
    expect(countEdits(e2)).toBe(3)
  })
  it('los cambios de precio se acumulan sobre el precio ya editado', () => {
    let e = applyBulk({}, ['b'], { kind: 'price', percent: 10 }, products)
    e = applyBulk(e, ['b'], { kind: 'price', percent: 10 }, products)
    expect(applyEdits(products, e).find((p) => p.id === 'b')!.price).toBe(6_100) // 5000 → 5500 → 6050, que se redondea a la centena
  })
  it('si el nuevo precio alcanza al anterior deja de ser oferta', () => {
    const e = applyBulk({}, ['a'], { kind: 'price', percent: 25 }, products) // 1000 → 1250 ≥ 1200
    expect(applyEdits(products, e).find((p) => p.id === 'a')!.oldPrice).toBeUndefined()
    const e2 = applyBulk({}, ['a'], { kind: 'price', percent: 5 }, products) // 1050 < 1200
    expect(applyEdits(products, e2).find((p) => p.id === 'a')!.oldPrice).toBe(1200)
  })
  it('ignora ids que no existen y funciona con el catálogo real', () => {
    const all = getAllProductsIncludingDrafts()
    expect(applyBulk({}, ['no-existe'], { kind: 'remove' }, all)).toEqual({})
    const out = applyEdits(all, applyBulk({}, [all[0].id, all[1].id], { kind: 'remove' }, all))
    expect(out).toHaveLength(all.length - 2)
  })
})
