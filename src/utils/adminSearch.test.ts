import { getAllProductsIncludingDrafts } from '@/services/catalogService'
import { generateFakeOrders } from './demoOrders'
import { buildCustomers } from './customers'
import { searchAdmin, type SearchSource } from './adminSearch'

const NOW = new Date('2026-10-05T12:00:00Z')
const products = getAllProductsIncludingDrafts()
const orders = generateFakeOrders(products, NOW)
const src: SearchSource = {
  sections: [
    { label: 'Inicio', to: '/admin' },
    { label: 'Productos', to: '/admin/productos', keywords: 'catálogo artículos' },
    { label: 'Pedidos', to: '/admin/pedidos', keywords: 'ventas' },
  ],
  products,
  orders,
  customers: buildCustomers(orders),
}

describe('searchAdmin', () => {
  it('sin texto devuelve las secciones como accesos rápidos', () => {
    expect(searchAdmin('', src).map((h) => h.group)).toEqual([
      'Secciones',
      'Secciones',
      'Secciones',
    ])
  })
  it('busca en secciones por nombre y palabras clave, sin distinguir tildes', () => {
    expect(searchAdmin('catalogo', src).map((h) => h.title)).toEqual(['Productos'])
    expect(searchAdmin('VENTAS', src)[0]).toMatchObject({
      group: 'Secciones',
      title: 'Pedidos',
      to: '/admin/pedidos',
    })
  })
  it('productos por nombre, marca o SKU, y enlazan al editor', () => {
    const hits = searchAdmin('lenovo ideapad', src)
    expect(hits[0]).toMatchObject({ group: 'Productos', to: '/admin/productos/p001' })
    expect(searchAdmin('TD-4021', src)[0].title).toMatch(/Lenovo/)
  })
  it('pedidos por número o cliente, clientes por nombre o teléfono', () => {
    const o = orders[0]
    expect(searchAdmin(o.id, src).find((h) => h.group === 'Pedidos')).toMatchObject({
      to: `/admin/pedidos?pedido=${o.id}`,
    })
    const c = src.customers[0]
    expect(searchAdmin(c.name, src).find((h) => h.group === 'Clientes')).toMatchObject({
      to: `/admin/clientes?cliente=${c.id}`,
    })
    expect(searchAdmin(c.phone, src).some((h) => h.group === 'Clientes')).toBe(true)
  })
  it('limita por grupo y mantiene el orden Secciones, Productos, Pedidos, Clientes', () => {
    const hits = searchAdmin('a', src, 2)
    for (const g of ['Secciones', 'Productos', 'Pedidos', 'Clientes'] as const)
      expect(hits.filter((h) => h.group === g).length).toBeLessThanOrEqual(2)
    const order = hits.map((h) => h.group)
    expect(order).toEqual(
      [...order].sort(
        (a, b) =>
          ['Secciones', 'Productos', 'Pedidos', 'Clientes'].indexOf(a) -
          ['Secciones', 'Productos', 'Pedidos', 'Clientes'].indexOf(b),
      ),
    )
  })
  it('sin coincidencias devuelve una lista vacía', () => {
    expect(searchAdmin('zzzzqqq', src)).toEqual([])
  })
})
