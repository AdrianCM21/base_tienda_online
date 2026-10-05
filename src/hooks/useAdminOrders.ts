import { useMemo, useState } from 'react'
import { getAllProductsIncludingDrafts } from '@/services/catalogService'
import { generateFakeOrders } from '@/utils/demoOrders'
import { listOrders } from '@/utils/orders'

/** Pedidos del panel: los hechos en el checkout de esta demo + pedidos de ejemplo. */
export function useAdminOrders() {
  const [now] = useState(() => new Date())
  return useMemo(() => {
    const real = listOrders()
    const fake = generateFakeOrders(getAllProductsIncludingDrafts(), now)
    const orders = [...real, ...fake].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return { orders, realIds: new Set(real.map((o) => o.id)), now }
  }, [now])
}
