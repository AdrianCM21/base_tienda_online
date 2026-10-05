import type { Category } from '@/types/category'
import type { ColorVariant, Product, ProductTag } from '@/types/product'
import { slugify } from '../text'
import {
  columnKeys,
  PRODUCT_COLUMNS,
  requiredKeys,
  SHEET_NAMES,
  SPEC_COLUMNS,
  VARIANT_COLUMNS,
  type ColumnDef,
} from './schema'
import type { ImportIssue, ImportResult, ParsedRow, ParsedSheet, ParsedWorkbook } from './types'

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i
const HEX = /^#[0-9A-Fa-f]{6}$/
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MAX_LISTED = 6

const isInt = (v: string) => /^\d+$/.test(v)
const isSignedInt = (v: string) => /^-?\d+$/.test(v)

/** si / no (y equivalentes) → boolean; vacío → undefined; otro texto → null (inválido). */
export function parseYesNo(value: string): boolean | undefined | null {
  const v = value.trim().toLowerCase()
  if (!v) return undefined
  if (['si', 'sí', 'true', 'verdadero', '1', 'x'].includes(v)) return true
  if (['no', 'false', 'falso', '0'].includes(v)) return false
  return null
}

const splitList = (value: string, sep: string) =>
  value
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean)

function isValidImageRef(ref: string): boolean {
  if (ref.toLowerCase() === 'placeholder') return true
  if (/^https?:\/\//i.test(ref)) {
    try {
      new URL(ref)
      return true
    } catch {
      return false
    }
  }
  return IMAGE_EXT.test(ref)
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

const preview = (list: string[]) =>
  list.length > MAX_LISTED ? `${list.slice(0, MAX_LISTED).join(', ')}…` : list.join(', ')

/**
 * Valida el libro ya parseado contra el catálogo de categorías y arma los productos a importar.
 * No lanza: todo problema queda en `issues` (con hoja, fila y columna).
 */
export function validateWorkbook(
  wb: ParsedWorkbook,
  categories: Category[],
  today: string = new Date().toISOString().slice(0, 10),
): ImportResult {
  const issues: ImportIssue[] = []
  const add = (
    severity: ImportIssue['severity'],
    sheet: string,
    row: number,
    column: string | undefined,
    message: string,
  ) => issues.push({ severity, sheet, row, column, message })

  const finish = (products: Product[], variants = 0, specs = 0, productRows = 0): ImportResult => ({
    products,
    issues,
    counts: {
      productRows,
      products: products.length,
      variants,
      specs,
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
    },
  })

  if (!wb.products) {
    add(
      'error',
      SHEET_NAMES.products,
      0,
      undefined,
      `No se encontró la hoja "${SHEET_NAMES.products}". Descargá la plantilla para ver el formato.`,
    )
    return finish([])
  }

  /** Revisa encabezados; devuelve false si faltan columnas obligatorias (se omiten las filas de esa hoja). */
  const checkHeaders = (sheet: ParsedSheet, cols: ColumnDef[]): boolean => {
    let ok = true
    for (const key of requiredKeys(cols)) {
      if (!sheet.headers.includes(key)) {
        ok = false
        add('error', sheet.name, 1, key, `Falta la columna obligatoria "${key}".`)
      }
    }
    for (const h of sheet.headers) {
      if (!columnKeys(cols).includes(h))
        add('warning', sheet.name, 1, h, `La columna "${h}" no es parte del formato y se ignora.`)
    }
    return ok
  }

  const productsOk = checkHeaders(wb.products, PRODUCT_COLUMNS)
  const variantsOk = wb.variants ? checkHeaders(wb.variants, VARIANT_COLUMNS) : false
  const specsOk = wb.specs ? checkHeaders(wb.specs, SPEC_COLUMNS) : false
  if (!productsOk)
    return finish([], wb.variants?.rows.length, wb.specs?.rows.length, wb.products.rows.length)

  // --- índices de categorías ---
  const catIndex = new Map<string, Category>()
  for (const c of categories) {
    catIndex.set(slugify(c.name), c)
    catIndex.set(c.slug, c)
  }
  const catNames = categories.map((c) => c.name)

  const S = SHEET_NAMES.products
  const seenSku = new Map<string, number>()
  const seenSlug = new Map<string, number>()
  for (const { row, values: v } of wb.products.rows) {
    const sku = v.sku
    if (!sku) continue
    if (seenSku.has(sku))
      add('error', S, row, 'sku', `SKU duplicado: "${sku}" ya está en la fila ${seenSku.get(sku)}.`)
    else seenSku.set(sku, row)
  }

  // --- variantes ---
  const V = SHEET_NAMES.variants
  const variantsBySku = new Map<string, ColorVariant[]>()
  const seenVariantSku = new Map<string, number>()
  if (wb.variants && variantsOk) {
    for (const { row, values: v } of wb.variants.rows) {
      const before = issues.length
      const bad = (column: string, message: string) => add('error', V, row, column, message)
      if (!v.sku) bad('sku', 'El SKU es obligatorio.')
      else if (!seenSku.has(v.sku)) bad('sku', `El SKU "${v.sku}" no existe en la hoja ${S}.`)
      if (!v.color_nombre) bad('color_nombre', 'El nombre del color es obligatorio.')
      if (!v.color_hex) bad('color_hex', 'El color es obligatorio (formato #RRGGBB).')
      else if (!HEX.test(v.color_hex))
        bad('color_hex', `"${v.color_hex}" no es un color válido; usá el formato #RRGGBB.`)
      if (!isInt(v.stock ?? ''))
        bad('stock', 'El stock debe ser un número entero mayor o igual a 0.')
      if (v.ajuste_precio && !isSignedInt(v.ajuste_precio))
        bad('ajuste_precio', 'El ajuste de precio debe ser un número entero (puede ser negativo).')
      const images = splitList(v.imagenes ?? '', '|')
      for (const img of images)
        if (!isValidImageRef(img))
          bad('imagenes', `"${img}" no parece una imagen válida (URL o archivo .jpg/.png/.webp).`)
      if (v.sku_variante) {
        if (seenVariantSku.has(v.sku_variante))
          bad(
            'sku_variante',
            `SKU de variante duplicado: ya está en la fila ${seenVariantSku.get(v.sku_variante)}.`,
          )
        else seenVariantSku.set(v.sku_variante, row)
      }
      const list = variantsBySku.get(v.sku) ?? []
      if (
        v.sku &&
        v.color_nombre &&
        list.some((c) => c.name.toLowerCase() === v.color_nombre.toLowerCase())
      )
        bad('color_nombre', `El color "${v.color_nombre}" está repetido para el SKU ${v.sku}.`)
      if (issues.length === before) {
        list.push({
          name: v.color_nombre,
          hex: v.color_hex.toUpperCase(),
          stock: Number(v.stock),
          ...(v.sku_variante ? { sku: v.sku_variante } : {}),
          ...(v.ajuste_precio && Number(v.ajuste_precio) !== 0
            ? { priceDelta: Number(v.ajuste_precio) }
            : {}),
          ...(images.length
            ? { images: images.filter((i) => i.toLowerCase() !== 'placeholder') }
            : {}),
        })
        variantsBySku.set(v.sku, list)
      }
    }
  }

  // --- especificaciones ---
  const E = SHEET_NAMES.specs
  const specsBySku = new Map<string, Record<string, string>>()
  if (wb.specs && specsOk) {
    for (const { row, values: v } of wb.specs.rows) {
      const before = issues.length
      const bad = (column: string, message: string) => add('error', E, row, column, message)
      if (!v.sku) bad('sku', 'El SKU es obligatorio.')
      else if (!seenSku.has(v.sku)) bad('sku', `El SKU "${v.sku}" no existe en la hoja ${S}.`)
      if (!v.atributo) bad('atributo', 'El atributo es obligatorio.')
      if (!v.valor) bad('valor', 'El valor es obligatorio.')
      if (parseYesNo(v.filtrable ?? '') === null) bad('filtrable', 'Usá "si" o "no".')
      const specs = specsBySku.get(v.sku) ?? {}
      if (v.atributo && v.atributo in specs)
        bad('atributo', `El atributo "${v.atributo}" está repetido para el SKU ${v.sku}.`)
      if (issues.length === before) {
        specs[v.atributo] = v.valor
        specsBySku.set(v.sku, specs)
      }
    }
  }

  // --- productos ---
  const products: Product[] = []
  let placeholders = 0
  const flag = (v: Record<string, string>, key: string, row: number): boolean | undefined => {
    const parsed = parseYesNo(v[key] ?? '')
    if (parsed === null) {
      add('error', S, row, key, `"${v[key]}" no es válido: usá "si" o "no".`)
      return undefined
    }
    return parsed
  }

  for (const { row, values: v } of wb.products.rows as ParsedRow[]) {
    const before = issues.length
    const bad = (column: string, message: string) => add('error', S, row, column, message)

    if (!v.sku) bad('sku', 'El SKU es obligatorio.')
    if (!v.nombre) bad('nombre', 'El nombre es obligatorio.')
    else if (v.nombre.length < 5 || v.nombre.length > 120)
      bad('nombre', `El nombre debe tener entre 5 y 120 caracteres (tiene ${v.nombre.length}).`)
    if (!v.marca) bad('marca', 'La marca es obligatoria.')

    let category: Category | undefined
    if (!v.categoria) bad('categoria', 'La categoría es obligatoria.')
    else {
      category = catIndex.get(slugify(v.categoria))
      if (!category)
        bad(
          'categoria',
          `La categoría "${v.categoria}" no existe. Categorías válidas: ${preview(catNames)}.`,
        )
    }
    let subSlug = ''
    if (!v.subcategoria) bad('subcategoria', 'La subcategoría es obligatoria.')
    else if (category) {
      const subs = category.groups.flatMap((g) => g.items)
      const sub = subs.find(
        (s) => s.slug === slugify(v.subcategoria) || slugify(s.name) === slugify(v.subcategoria),
      )
      if (!sub)
        bad(
          'subcategoria',
          `"${v.subcategoria}" no es una subcategoría de ${category.name}. Opciones: ${preview(subs.map((s) => s.name))}.`,
        )
      else subSlug = sub.slug
    }

    if (!isInt(v.precio) || Number(v.precio) <= 0)
      bad('precio', 'El precio debe ser un número entero mayor a 0, sin puntos ni símbolos.')
    if (!isInt(v.stock)) bad('stock', 'El stock debe ser un número entero mayor o igual a 0.')

    if (!v.descripcion_corta) bad('descripcion_corta', 'La descripción corta es obligatoria.')
    else if (v.descripcion_corta.length > 160)
      bad('descripcion_corta', `Máximo 160 caracteres (tiene ${v.descripcion_corta.length}).`)
    if (!v.descripcion) bad('descripcion', 'La descripción es obligatoria.')
    else if (v.descripcion.length < 40)
      add(
        'warning',
        S,
        row,
        'descripcion',
        'La descripción es muy corta; conviene explicar mejor el producto.',
      )

    if (!v.imagen_principal)
      bad(
        'imagen_principal',
        'La imagen principal es obligatoria (escribí "placeholder" si todavía no hay foto).',
      )
    else if (!isValidImageRef(v.imagen_principal))
      bad(
        'imagen_principal',
        `"${v.imagen_principal}" no parece una imagen válida (URL o archivo .jpg/.png/.webp).`,
      )
    const extras = splitList(v.imagenes_extra ?? '', '|')
    for (const img of extras)
      if (!isValidImageRef(img)) bad('imagenes_extra', `"${img}" no parece una imagen válida.`)

    let oldPrice: number | undefined
    if (v.precio_anterior) {
      if (!isInt(v.precio_anterior))
        bad('precio_anterior', 'El precio anterior debe ser un número entero.')
      else if (isInt(v.precio) && Number(v.precio_anterior) <= Number(v.precio))
        bad('precio_anterior', 'El precio anterior debe ser mayor que el precio actual.')
      else oldPrice = Number(v.precio_anterior)
    }
    let cuotas: number | undefined
    if (v.cuotas) {
      if (!isInt(v.cuotas) || Number(v.cuotas) < 1 || Number(v.cuotas) > 18)
        bad('cuotas', 'Las cuotas deben ser un entero entre 1 y 18.')
      else cuotas = Number(v.cuotas)
    }
    const destacado = flag(v, 'destacado', row)
    const nuevo = flag(v, 'nuevo', row)
    const envioGratis = flag(v, 'envio_gratis', row)

    let rating: number | undefined
    if (v.calificacion) {
      const n = Number(v.calificacion.replace(',', '.'))
      if (!/^\d+([.,]\d+)?$/.test(v.calificacion) || n < 0 || n > 5)
        bad('calificacion', 'La calificación debe ser un número de 0 a 5.')
      else rating = Math.round(n * 10) / 10
    }
    let reviewCount: number | undefined
    if (v.cantidad_opiniones) {
      if (!isInt(v.cantidad_opiniones))
        bad('cantidad_opiniones', 'La cantidad de opiniones debe ser un entero mayor o igual a 0.')
      else reviewCount = Number(v.cantidad_opiniones)
    }
    const highlights = splitList(v.puntos_destacados ?? '', '|')
    if (highlights.length > 5)
      bad('puntos_destacados', `Máximo 5 puntos destacados (hay ${highlights.length}).`)
    if (v.fecha_ingreso && !isValidDate(v.fecha_ingreso))
      bad('fecha_ingreso', 'La fecha debe tener el formato AAAA-MM-DD (por ejemplo 2026-09-30).')
    if (v.slug && !SLUG.test(v.slug))
      bad('slug', 'El slug solo admite minúsculas, números y guiones (ej. mi-producto).')
    if (v.estado && !['activo', 'borrador'].includes(v.estado.toLowerCase()))
      bad('estado', 'El estado debe ser "activo" o "borrador".')

    const slug = v.slug || slugify(v.nombre ?? '')
    if (slug && SLUG.test(slug)) {
      if (seenSlug.has(slug))
        bad(
          'slug',
          `El slug "${slug}" ya lo usa la fila ${seenSlug.get(slug)}; indicá uno distinto en la columna slug.`,
        )
      else seenSlug.set(slug, row)
    }

    const colors = variantsBySku.get(v.sku) ?? []
    const specs = specsBySku.get(v.sku) ?? {}
    if (colors.length && isInt(v.stock) && Number(v.stock) > 0) {
      const total = colors.reduce((n, c) => n + c.stock, 0)
      if (total !== Number(v.stock))
        add(
          'warning',
          S,
          row,
          'stock',
          `Este producto tiene variantes: se ignora el stock (${v.stock}) y se usa la suma de las variantes (${total}).`,
        )
    }
    if (!Object.keys(specs).length)
      add(
        'warning',
        S,
        row,
        undefined,
        'No tiene especificaciones: la pestaña y los filtros quedarán vacíos.',
      )
    if (v.imagen_principal?.toLowerCase() === 'placeholder') placeholders++

    if (issues.length !== before && issues.slice(before).some((i) => i.severity === 'error'))
      continue

    const tags: ProductTag[] = []
    if (destacado) tags.push('destacado')
    if (oldPrice) tags.push('oferta')
    if (nuevo) tags.push('nuevo')
    if (envioGratis) tags.push('envio-gratis')
    const main = v.imagen_principal.toLowerCase() === 'placeholder' ? [] : [v.imagen_principal]
    products.push({
      id: `imp-${products.length + 1}`,
      sku: v.sku,
      slug,
      name: v.nombre,
      brand: v.marca,
      categoryId: category!.slug,
      subcategoryId: subSlug,
      price: Number(v.precio),
      ...(oldPrice ? { oldPrice } : {}),
      ...(cuotas ? { installments: { count: cuotas, interestFree: true } } : {}),
      stock: colors.length ? colors.reduce((n, c) => n + c.stock, 0) : Number(v.stock),
      shortDescription: v.descripcion_corta,
      description: v.descripcion,
      images: [...main, ...extras.filter((i) => i.toLowerCase() !== 'placeholder')],
      colors,
      specs,
      ...(highlights.length ? { highlights } : {}),
      tags,
      ...(splitList(v.etiquetas ?? '', ',').length
        ? { keywords: splitList(v.etiquetas, ',') }
        : {}),
      ...(rating !== undefined ? { rating } : {}),
      ...(reviewCount !== undefined ? { reviewCount } : {}),
      ...(v.garantia ? { warranty: v.garantia } : {}),
      createdAt: v.fecha_ingreso || today,
      status: v.estado?.toLowerCase() === 'borrador' ? 'borrador' : 'activo',
    })
  }

  if (placeholders > 0)
    add(
      'warning',
      S,
      0,
      'imagen_principal',
      `${placeholders} producto(s) usan "placeholder" como imagen principal.`,
    )

  return finish(
    products,
    wb.variants?.rows.length ?? 0,
    wb.specs?.rows.length ?? 0,
    wb.products.rows.length,
  )
}
