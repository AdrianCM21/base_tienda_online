import type { Category } from '@/types/category'
import type { Product } from '@/types/product'
import { PRODUCT_COLUMNS, SHEET_NAMES, SPEC_COLUMNS, VARIANT_COLUMNS, columnKeys } from './schema'

type Cell = string | number
const yesNo = (v: boolean): string => (v ? 'si' : 'no')

/**
 * Catálogo completo en el mismo formato de la plantilla de importación (3 hojas de datos),
 * de modo que el archivo exportado se puede volver a subir sin errores.
 */
export async function buildCatalogExport(
  products: Product[],
  categories: Category[],
): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const catName = new Map(categories.map((c) => [c.slug, c.name]))
  const subs = new Map(
    categories.flatMap((c) => c.groups.flatMap((g) => g.items.map((s) => [s.slug, s] as const))),
  )

  const productRows: Cell[][] = products.map((p) => {
    const has = (tag: NonNullable<Product['tags']>[number]) => !!p.tags?.includes(tag)
    const values: Record<string, Cell> = {
      sku: p.sku,
      nombre: p.name,
      marca: p.brand,
      categoria: catName.get(p.categoryId) ?? p.categoryId,
      subcategoria: subs.get(p.subcategoryId)?.name ?? p.subcategoryId,
      precio: p.price,
      stock: p.stock,
      descripcion_corta: p.shortDescription,
      descripcion: p.description,
      imagen_principal: p.images[0] ?? 'placeholder',
      precio_anterior: p.oldPrice ?? '',
      cuotas: p.installments?.count ?? '',
      imagenes_extra: p.images.slice(1).join('|'),
      destacado: yesNo(has('destacado')),
      nuevo: yesNo(has('nuevo')),
      envio_gratis: yesNo(has('envio-gratis')),
      garantia: p.warranty ?? '',
      calificacion: p.rating ?? '',
      cantidad_opiniones: p.reviewCount ?? '',
      puntos_destacados: (p.highlights ?? []).slice(0, 5).join('|'),
      etiquetas: (p.keywords ?? []).join(', '),
      fecha_ingreso: p.createdAt,
      slug: p.slug,
      estado: p.status,
    }
    return PRODUCT_COLUMNS.map((c) => values[c.key] ?? '')
  })

  const variantRows: Cell[][] = products.flatMap((p) =>
    p.colors.map((c) => {
      const values: Record<string, Cell> = {
        sku: p.sku,
        color_nombre: c.name,
        color_hex: c.hex,
        stock: c.stock,
        sku_variante: c.sku ?? '',
        ajuste_precio: c.priceDelta ?? '',
        imagenes: (c.images ?? []).join('|'),
      }
      return VARIANT_COLUMNS.map((col) => values[col.key] ?? '')
    }),
  )

  const specRows: Cell[][] = products.flatMap((p) =>
    Object.entries(p.specs).map(([attr, value]) => {
      const filterable = subs.get(p.subcategoryId)?.filterSpecs?.includes(attr) ?? false
      const values: Record<string, Cell> = {
        sku: p.sku,
        grupo: '',
        atributo: attr,
        valor: value,
        filtrable: filterable ? 'si' : '',
      }
      return SPEC_COLUMNS.map((col) => values[col.key] ?? '')
    }),
  )

  const wb = XLSX.utils.book_new()
  const add = (name: string, cols: typeof PRODUCT_COLUMNS, rows: Cell[][]) => {
    const ws = XLSX.utils.aoa_to_sheet([columnKeys(cols), ...rows])
    ws['!cols'] = columnKeys(cols).map((k) => ({ wch: Math.max(14, k.length + 4) }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  }
  add(SHEET_NAMES.products, PRODUCT_COLUMNS, productRows)
  add(SHEET_NAMES.variants, VARIANT_COLUMNS, variantRows)
  add(SHEET_NAMES.specs, SPEC_COLUMNS, specRows)
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}
