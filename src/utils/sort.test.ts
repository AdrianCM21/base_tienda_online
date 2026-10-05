import { compareValues, sortProducts } from './sort'
import { makeProduct as mk } from './testProducts'

const a = mk({
  id: 'a',
  name: 'A',
  price: 300,
  createdAt: '2026-01-01',
  rating: 4,
  reviewCount: 10,
})
const b = mk({
  id: 'b',
  name: 'B',
  price: 100,
  createdAt: '2026-03-01',
  rating: 5,
  reviewCount: 100,
})
const c = mk({
  id: 'c',
  name: 'C',
  price: 200,
  createdAt: '2026-02-01',
  tags: ['destacado'],
  stock: 0,
})
const d = mk({ id: 'd', name: 'D', price: 200, createdAt: '2026-02-01' })
const ids = (l: (typeof a)[]) => l.map((p) => p.id)

describe('sortProducts', () => {
  it('menor / mayor precio, desempata por nombre', () => {
    expect(ids(sortProducts([a, b, c, d], 'menor-precio'))).toEqual(['b', 'c', 'd', 'a'])
    expect(ids(sortProducts([a, b, c, d], 'mayor-precio'))).toEqual(['a', 'c', 'd', 'b'])
  })
  it('más nuevos', () => {
    expect(ids(sortProducts([a, b, d], 'nuevos'))).toEqual(['b', 'd', 'a'])
  })
  it('relevancia: destacados y populares primero, sin stock al final', () => {
    expect(ids(sortProducts([a, b, c, d], 'relevancia'))).toEqual(['b', 'a', 'd', 'c'])
  })
  it('no muta la lista original', () => {
    const list = [a, b]
    sortProducts(list, 'menor-precio')
    expect(ids(list)).toEqual(['a', 'b'])
  })
})

describe('compareValues', () => {
  it('ordena números como números y textos de forma natural', () => {
    expect([10, 2, 33].sort(compareValues)).toEqual([2, 10, 33])
    expect(['Item 10', 'item 2', 'Árbol'].sort(compareValues)).toEqual([
      'Árbol',
      'item 2',
      'Item 10',
    ])
  })
})
