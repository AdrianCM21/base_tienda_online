import type { Category } from '@/types/category'
import {
  PRODUCT_COLUMNS,
  SHEET_NAMES,
  SPEC_COLUMNS,
  VARIANT_COLUMNS,
  columnKeys,
  type ColumnDef,
} from './schema'

type Cell = string | number

const rowOf = (cols: ColumnDef[], over: Record<string, Cell> = {}): Cell[] =>
  cols.map((c) => over[c.key] ?? '')
const examples = (cols: ColumnDef[]): Cell[] => cols.map((c) => c.example)

/** Plantilla .xlsx descargable: 4 hojas, con encabezados, filas de ejemplo válidas e instrucciones. */
export async function buildTemplate(categories: Category[]): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  const cat = categories.find((c) => c.slug === 'informatica') ?? categories[0]
  const sub = cat?.groups.flatMap((g) => g.items)[0]
  const sample = { categoria: cat?.name ?? '', subcategoria: sub?.name ?? '' }
  const backpackSub = cat?.groups
    .flatMap((g) => g.items)
    .find((s) => s.slug === 'mochilas-y-fundas')?.name

  const product1 = Object.fromEntries(PRODUCT_COLUMNS.map((c) => [c.key, c.example]))
  const product2: Record<string, Cell> = {
    sku: 'TD-5002',
    nombre: 'Mochila Urbana Impermeable 15.6"',
    marca: 'Acme',
    precio: 249000,
    stock: 0,
    descripcion_corta: 'Resistente al agua, con compartimento acolchado para notebook.',
    descripcion:
      'Mochila urbana con tres compartimentos, cierres reforzados y espalda acolchada para uso diario.',
    imagen_principal: 'placeholder',
    cuotas: 3,
  }
  const sheets: [string, Cell[][]][] = [
    [
      SHEET_NAMES.products,
      [
        columnKeys(PRODUCT_COLUMNS),
        rowOf(PRODUCT_COLUMNS, { ...product1, ...sample, precio: 5490000, stock: 0 }),
        rowOf(PRODUCT_COLUMNS, {
          ...product2,
          ...sample,
          subcategoria: backpackSub ?? sample.subcategoria,
        }),
      ],
    ],
    [
      SHEET_NAMES.variants,
      [
        columnKeys(VARIANT_COLUMNS),
        examples(VARIANT_COLUMNS),
        rowOf(VARIANT_COLUMNS, {
          sku: 'TD-5001',
          color_nombre: 'Plata',
          color_hex: '#C0C4CC',
          stock: 4,
          sku_variante: 'TD-5001-PLA',
          ajuste_precio: 100000,
        }),
        rowOf(VARIANT_COLUMNS, {
          sku: 'TD-5002',
          color_nombre: 'Negro',
          color_hex: '#111827',
          stock: 15,
        }),
      ],
    ],
    [
      SHEET_NAMES.specs,
      [
        columnKeys(SPEC_COLUMNS),
        examples(SPEC_COLUMNS),
        rowOf(SPEC_COLUMNS, {
          sku: 'TD-5001',
          grupo: 'Rendimiento',
          atributo: 'Procesador',
          valor: 'AMD Ryzen 5',
          filtrable: 'si',
        }),
        rowOf(SPEC_COLUMNS, {
          sku: 'TD-5002',
          atributo: 'Material',
          valor: 'Poliéster impermeable',
        }),
      ],
    ],
  ]

  const help: Cell[][] = [
    ['Cómo completar el archivo'],
    [
      '• Una fila por producto en la hoja Productos. Las hojas Variantes (colores) y Especificaciones son opcionales y se unen por el SKU.',
    ],
    [
      '• Las columnas marcadas "Sí" en Obligatorio no pueden quedar vacías. No cambies los nombres de los encabezados.',
    ],
    [
      '• Las listas dentro de una celda se separan con | (barra vertical); las etiquetas, con coma.',
    ],
    [],
    ['Hoja', 'Columna', 'Obligatorio', 'Descripción', 'Ejemplo'],
    ...(
      [
        [SHEET_NAMES.products, PRODUCT_COLUMNS],
        [SHEET_NAMES.variants, VARIANT_COLUMNS],
        [SHEET_NAMES.specs, SPEC_COLUMNS],
      ] as const
    ).flatMap(([sheet, cols]) =>
      cols.map((c): Cell[] => [sheet, c.key, c.required ? 'Sí' : 'No', c.description, c.example]),
    ),
    [],
    ['Categorías y subcategorías válidas'],
    ...categories.map((c): Cell[] => [
      c.name,
      c.groups.flatMap((g) => g.items.map((s) => s.name)).join(', '),
    ]),
  ]
  sheets.push([SHEET_NAMES.help, help])

  for (const [name, aoa] of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = (aoa[name === SHEET_NAMES.help ? 5 : 0] ?? []).map((h, i) => ({
      wch:
        name === SHEET_NAMES.help
          ? ([16, 20, 12, 80, 40][i] ?? 20)
          : Math.max(14, String(h).length + 4),
    }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  }
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}
