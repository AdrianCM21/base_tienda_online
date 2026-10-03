import { pageWindow, paginate } from './paginate'

const list = Array.from({ length: 20 }, (_, i) => i + 1)

describe('paginate', () => {
  it('primera página', () => {
    const p = paginate(list, 1, 9)
    expect(p).toMatchObject({ page: 1, pageCount: 3, total: 20, from: 1, to: 9 })
    expect(p.items).toHaveLength(9)
  })
  it('última página parcial', () => {
    expect(paginate(list, 3, 9)).toMatchObject({ from: 19, to: 20 })
  })
  it('ajusta páginas fuera de rango o inválidas', () => {
    expect(paginate(list, 99, 9).page).toBe(3)
    expect(paginate(list, 0, 9).page).toBe(1)
    expect(paginate(list, NaN, 9).page).toBe(1)
  })
  it('lista vacía', () => {
    expect(paginate([], 1, 9)).toMatchObject({ items: [], pageCount: 1, from: 0, to: 0, total: 0 })
  })
})

describe('pageWindow', () => {
  it('muestra todas si son pocas', () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5])
  })
  it('usa elipsis en listas largas', () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, '…', 20])
    expect(pageWindow(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20])
    expect(pageWindow(20, 20)).toEqual([1, '…', 19, 20])
  })
})
