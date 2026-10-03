export type Page<T> = {
  items: T[]
  page: number
  pageSize: number
  pageCount: number
  total: number
  from: number
  to: number
}

/** Pagina una lista; `page` (1-based) se ajusta al rango válido. */
export function paginate<T>(list: T[], page = 1, pageSize = 9): Page<T> {
  const total = list.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safe = Math.min(Math.max(1, Math.floor(page) || 1), pageCount)
  const start = (safe - 1) * pageSize
  const items = list.slice(start, start + pageSize)
  return {
    items,
    page: safe,
    pageSize,
    pageCount,
    total,
    from: items.length ? start + 1 : 0,
    to: start + items.length,
  }
}

/** Páginas visibles: todas si son pocas; si no, 1 … actual±1 … última. */
export function pageWindow(page: number, pageCount: number): (number | '…')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const set = new Set(
    [1, pageCount, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pageCount),
  )
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
}
