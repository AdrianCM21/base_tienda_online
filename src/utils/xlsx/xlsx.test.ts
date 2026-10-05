import { getCategories } from '@/services/catalogService'
import { buildErrorReport } from './report'
import { cellToString, matrixToSheet, normalizeHeader, parseWorkbook } from './parse'
import { buildTemplate } from './template'
import type { ParsedSheet, ParsedWorkbook } from './types'
import { parseYesNo, validateWorkbook } from './validate'

const categories = getCategories()
const TODAY = '2026-10-05'

const sheet = (name: string, rows: Record<string, string>[]): ParsedSheet => ({
  name,
  headers: [...new Set(rows.flatMap((r) => Object.keys(r)))],
  rows: rows.map((values, i) => ({ row: i + 2, values })),
})

const ok = {
  sku: 'A-1',
  nombre: 'Notebook de prueba 15"',
  marca: 'Acme',
  categoria: 'Informática',
  subcategoria: 'Notebooks',
  precio: '1000000',
  stock: '5',
  descripcion_corta: 'Corta',
  descripcion: 'Una descripción lo bastante larga para no generar advertencias.',
  imagen_principal: 'foto.jpg',
}
const wbOf = (
  products: Record<string, string>[],
  variants?: Record<string, string>[],
  specs?: Record<string, string>[],
): ParsedWorkbook => ({
  products: sheet('Productos', products),
  variants: variants && sheet('Variantes', variants),
  specs: specs && sheet('Especificaciones', specs),
})
const errors = (r: ReturnType<typeof validateWorkbook>) =>
  r.issues.filter((i) => i.severity === 'error')

describe('parse helpers', () => {
  it('cellToString: fechas, booleanos, números y espacios', () => {
    expect(cellToString(new Date(Date.UTC(2026, 8, 30)))).toBe('2026-09-30')
    expect(cellToString(new Date(Date.UTC(2026, 8, 29, 23, 59, 30)))).toBe('2026-09-30') // desfase típico de SheetJS
    expect(cellToString(true)).toBe('si')
    expect(cellToString(4590000)).toBe('4590000')
    expect(cellToString('  hola ')).toBe('hola')
    expect(cellToString(null)).toBe('')
  })
  it('normalizeHeader', () => {
    expect(normalizeHeader(' Descripción Corta ')).toBe('descripcion_corta')
  })
  it('matrixToSheet ignora filas vacías pero conserva el número de fila de Excel', () => {
    const s = matrixToSheet('Productos', [
      ['SKU', 'Nombre'],
      ['a', 'x'],
      ['', ''],
      ['b', 'y'],
    ])
    expect(s.headers).toEqual(['sku', 'nombre'])
    expect(s.rows.map((r) => r.row)).toEqual([2, 4])
  })
  it('parseYesNo', () => {
    expect([parseYesNo('Sí'), parseYesNo('NO'), parseYesNo(''), parseYesNo('quizás')]).toEqual([
      true,
      false,
      undefined,
      null,
    ])
  })
})

describe('plantilla → lectura → validación (ida y vuelta)', () => {
  it('la plantilla descargada se vuelve a subir y valida sin errores', async () => {
    const buf = await buildTemplate(categories)
    const wb = await parseWorkbook(buf)
    expect(wb.products?.rows).toHaveLength(2)
    expect(wb.variants?.rows).toHaveLength(3)
    expect(wb.specs?.rows).toHaveLength(3)
    const r = validateWorkbook(wb, categories, TODAY)
    expect(errors(r)).toEqual([])
    expect(r.counts).toMatchObject({
      productRows: 2,
      products: 2,
      variants: 3,
      specs: 3,
      errors: 0,
    })
    const [notebook, mochila] = r.products
    expect(notebook).toMatchObject({
      sku: 'TD-5001',
      categoryId: 'informatica',
      subcategoryId: 'notebooks',
      price: 5490000,
      oldPrice: 5990000,
      stock: 12,
      createdAt: '2026-09-30',
    })
    expect(notebook.colors.map((c) => c.name)).toEqual(['Gris Grafito', 'Plata'])
    expect(notebook.colors[1]).toMatchObject({ priceDelta: 100000, sku: 'TD-5001-PLA' })
    expect(notebook.specs).toEqual({ 'Memoria RAM': '16 GB', Procesador: 'AMD Ryzen 5' })
    expect(notebook.tags).toEqual(expect.arrayContaining(['destacado', 'oferta', 'envio-gratis']))
    expect(mochila).toMatchObject({
      stock: 15,
      images: [],
      createdAt: TODAY,
      installments: { count: 3, interestFree: true },
    })
    expect(r.issues.some((i) => i.severity === 'warning' && /placeholder/.test(i.message))).toBe(
      true,
    )
  })

  it('lee fechas reales de Excel', async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(
      [
        ['sku', 'fecha_ingreso'],
        ['A-1', new Date(Date.UTC(2026, 8, 30))],
      ],
      { cellDates: true },
    )
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    const parsed = await parseWorkbook(
      XLSX.write(wb, { type: 'array', bookType: 'xlsx', cellDates: true }) as ArrayBuffer,
    )
    expect(parsed.products?.rows[0].values.fecha_ingreso).toBe('2026-09-30')
  })
})

describe('validateWorkbook', () => {
  it('un producto válido mínimo no genera errores', () => {
    const r = validateWorkbook(wbOf([ok]), categories, TODAY)
    expect(errors(r)).toEqual([])
    expect(r.products[0]).toMatchObject({
      slug: 'notebook-de-prueba-15',
      status: 'activo',
      stock: 5,
      images: ['foto.jpg'],
    })
  })

  it('falta la hoja Productos', () => {
    const r = validateWorkbook({}, categories, TODAY)
    expect(r.counts.errors).toBe(1)
    expect(r.issues[0]).toMatchObject({ sheet: 'Productos', row: 0 })
  })

  it('columnas obligatorias ausentes: un error por columna en la fila 1', () => {
    const { precio: _p, stock: _s, ...rest } = ok
    const r = validateWorkbook(wbOf([rest]), categories, TODAY)
    expect(errors(r).map((i) => [i.row, i.column])).toEqual([
      [1, 'precio'],
      [1, 'stock'],
    ])
    expect(r.products).toEqual([])
  })

  it('cada error indica hoja, fila, columna y motivo', () => {
    const r = validateWorkbook(
      wbOf([
        { ...ok, sku: 'DUP', precio: 'abc' },
        { ...ok, sku: 'DUP', categoria: 'Inexistente', nombre: 'abc' },
        {
          ...ok,
          sku: 'B-2',
          subcategoria: 'Smart TV',
          nombre: 'Otro producto válido',
          precio_anterior: '500',
          cuotas: '30',
          destacado: 'quizás',
          fecha_ingreso: '2026-13-40',
          calificacion: '7',
          slug: 'Mal Slug',
        },
      ]),
      categories,
      TODAY,
    )
    const found = errors(r).map((i) => `${i.sheet}:${i.row}:${i.column}`)
    expect(found).toEqual(
      expect.arrayContaining([
        'Productos:2:precio',
        'Productos:3:sku',
        'Productos:3:nombre',
        'Productos:3:categoria',
        'Productos:4:subcategoria',
        'Productos:4:precio_anterior',
        'Productos:4:cuotas',
        'Productos:4:destacado',
        'Productos:4:fecha_ingreso',
        'Productos:4:calificacion',
        'Productos:4:slug',
      ]),
    )
    expect(errors(r).find((i) => i.column === 'categoria')!.message).toMatch(/Informática/)
    expect(r.products).toEqual([])
  })

  it('slug duplicado entre productos', () => {
    const r = validateWorkbook(wbOf([ok, { ...ok, sku: 'A-2' }]), categories, TODAY)
    expect(errors(r).map((i) => [i.row, i.column])).toEqual([[3, 'slug']])
  })

  it('variantes: SKU huérfano, color inválido, repetido y SKU de variante duplicado', () => {
    const r = validateWorkbook(
      wbOf(
        [ok],
        [
          { sku: 'ZZZ', color_nombre: 'Rojo', color_hex: '#FF0000', stock: '1' },
          { sku: 'A-1', color_nombre: 'Azul', color_hex: 'azul', stock: '-2' },
          {
            sku: 'A-1',
            color_nombre: 'Verde',
            color_hex: '#00FF00',
            stock: '3',
            sku_variante: 'V1',
          },
          {
            sku: 'A-1',
            color_nombre: 'verde',
            color_hex: '#00FF00',
            stock: '3',
            sku_variante: 'V1',
          },
        ],
      ),
      categories,
      TODAY,
    )
    expect(errors(r).map((i) => `${i.sheet}:${i.row}:${i.column}`)).toEqual([
      'Variantes:2:sku',
      'Variantes:3:color_hex',
      'Variantes:3:stock',
      'Variantes:5:sku_variante',
      'Variantes:5:color_nombre',
    ])
  })

  it('con variantes el stock es la suma y se avisa si difiere', () => {
    const r = validateWorkbook(
      wbOf(
        [ok],
        [
          { sku: 'A-1', color_nombre: 'Rojo', color_hex: '#ff0000', stock: '2' },
          { sku: 'A-1', color_nombre: 'Azul', color_hex: '#0000FF', stock: '3' },
        ],
      ),
      categories,
      TODAY,
    )
    expect(errors(r)).toEqual([])
    expect(r.products[0].stock).toBe(5)
    expect(r.products[0].colors[0].hex).toBe('#FF0000')
    const r2 = validateWorkbook(
      wbOf(
        [{ ...ok, stock: '99' }],
        [{ sku: 'A-1', color_nombre: 'Rojo', color_hex: '#ff0000', stock: '2' }],
      ),
      categories,
      TODAY,
    )
    expect(r2.products[0].stock).toBe(2)
    expect(r2.issues.some((i) => i.severity === 'warning' && i.column === 'stock')).toBe(true)
  })

  it('especificaciones: huérfanas, vacías y repetidas', () => {
    const r = validateWorkbook(
      wbOf([ok], undefined, [
        { sku: 'NOPE', atributo: 'RAM', valor: '8 GB' },
        { sku: 'A-1', atributo: '', valor: '8 GB' },
        { sku: 'A-1', atributo: 'RAM', valor: '8 GB', filtrable: 'si' },
        { sku: 'A-1', atributo: 'RAM', valor: '16 GB' },
      ]),
      categories,
      TODAY,
    )
    expect(errors(r).map((i) => `${i.row}:${i.column}`)).toEqual([
      '2:sku',
      '3:atributo',
      '5:atributo',
    ])
  })

  it('advertencias no bloquean: sin especificaciones, descripción corta, columnas desconocidas', () => {
    const r = validateWorkbook(
      wbOf([{ ...ok, descripcion: 'Muy corta', extra: 'x' }]),
      categories,
      TODAY,
    )
    expect(errors(r)).toEqual([])
    expect(r.products).toHaveLength(1)
    expect(
      r.issues.filter((i) => i.severity === 'warning').map((i) => i.column ?? '(fila)'),
    ).toEqual(expect.arrayContaining(['extra', 'descripcion', '(fila)']))
  })

  it('acepta categoría y subcategoría por nombre sin tildes/mayúsculas o por slug', () => {
    const r = validateWorkbook(
      wbOf([
        { ...ok, categoria: 'informatica', subcategoria: 'NOTEBOOKS GAMER' },
        {
          ...ok,
          sku: 'A-2',
          nombre: 'Otro notebook gamer',
          categoria: 'Electrónica',
          subcategoria: 'smart-tv',
        },
      ]),
      categories,
      TODAY,
    )
    expect(errors(r)).toEqual([])
    expect(r.products.map((p) => p.subcategoryId)).toEqual(['notebooks-gamer', 'smart-tv'])
  })
})

describe('buildErrorReport', () => {
  it('genera CSV con BOM, comillas escapadas y fila vacía para errores globales', () => {
    const csv = buildErrorReport([
      {
        severity: 'error',
        sheet: 'Productos',
        row: 3,
        column: 'precio',
        message: 'Dice "mal", y coma',
      },
      { severity: 'warning', sheet: 'Productos', row: 0, message: 'Global' },
    ])
    const lines = csv.split('\r\n')
    expect(csv.startsWith('﻿"Severidad"')).toBe(true)
    expect(lines[1]).toBe('"Error","Productos","3","precio","Dice ""mal"", y coma"')
    expect(lines[2]).toBe('"Advertencia","Productos","","","Global"')
  })
})
