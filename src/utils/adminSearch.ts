import type { Order } from '@/types/order'
import type { Product } from '@/types/product'
import type { Customer } from './customers'
import { normalizeText } from './text'

export type SearchGroup = 'Secciones' | 'Productos' | 'Pedidos' | 'Clientes'

export type SearchHit = {
  id: string
  group: SearchGroup
  title: string
  subtitle?: string
  to: string
}

export type SearchSource = {
  sections: { label: string; to: string; keywords?: string }[]
  products: Product[]
  orders: Order[]
  customers: Customer[]
}

const GROUP_ORDER: SearchGroup[] = ['Secciones', 'Productos', 'Pedidos', 'Clientes']
const matches = (haystack: string, tokens: string[]) => {
  const h = normalizeText(haystack)
  return tokens.every((t) => h.includes(t))
}

/**
 * Búsqueda global del panel. Sin texto devuelve las secciones (accesos rápidos); con texto busca en
 * secciones, productos (nombre, marca, SKU), pedidos (número, cliente) y clientes (nombre, teléfono, ciudad).
 */
export function searchAdmin(query: string, src: SearchSource, limitPerGroup = 4): SearchHit[] {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean)
  const sections: SearchHit[] = src.sections
    .filter((s) => !tokens.length || matches(`${s.label} ${s.keywords ?? ''}`, tokens))
    .map((s) => ({ id: `s:${s.to}`, group: 'Secciones', title: s.label, to: s.to }))
  if (!tokens.length) return sections

  const products: SearchHit[] = src.products
    .filter((p) => matches(`${p.name} ${p.brand} ${p.sku}`, tokens))
    .map((p) => ({
      id: `p:${p.id}`,
      group: 'Productos',
      title: p.name,
      subtitle: `${p.sku} · ${p.brand}${p.status === 'borrador' ? ' · Borrador' : ''}`,
      to: `/admin/productos/${p.id}`,
    }))
  const orders: SearchHit[] = src.orders
    .filter((o) => matches(`${o.id} ${o.shippingData.fullName}`, tokens))
    .map((o) => ({
      id: `o:${o.id}`,
      group: 'Pedidos',
      title: o.id,
      subtitle: o.shippingData.fullName,
      to: `/admin/pedidos?pedido=${o.id}`,
    }))
  const customers: SearchHit[] = src.customers
    .filter((c) => matches(`${c.name} ${c.phone} ${c.city}`, tokens))
    .map((c) => ({
      id: `c:${c.id}`,
      group: 'Clientes',
      title: c.name,
      subtitle: `${c.phone} · ${c.city}`,
      to: `/admin/clientes?cliente=${c.id}`,
    }))

  const all = [...sections, ...products, ...orders, ...customers]
  return GROUP_ORDER.flatMap((g) => all.filter((h) => h.group === g).slice(0, limitPerGroup))
}
