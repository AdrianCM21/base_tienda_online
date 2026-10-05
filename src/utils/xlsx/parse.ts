import type { ParsedRow, ParsedSheet, ParsedWorkbook } from './types'
import { SHEET_NAMES } from './schema'

/** Convierte cualquier valor de celda a texto limpio (las fechas pasan a AAAA-MM-DD). */
export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    // SheetJS entrega las fechas con pequeños desfases de huso/segundos: se redondea al día más cercano.
    const noon = new Date(value.getTime() + 12 * 3_600_000)
    return noon.toISOString().slice(0, 10)
  }
  if (typeof value === 'boolean') return value ? 'si' : 'no'
  return String(value).trim()
}

/** "Descripción Corta " → "descripcion_corta" */
export function normalizeHeader(header: string): string {
  return header.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '_')
}

/** Convierte una matriz (primera fila = encabezados) en una hoja normalizada; ignora filas vacías. */
export function matrixToSheet(name: string, matrix: unknown[][]): ParsedSheet {
  const [head = [], ...body] = matrix
  const headers = head.map((h) => normalizeHeader(cellToString(h)))
  const rows: ParsedRow[] = []
  body.forEach((cells, i) => {
    const values: Record<string, string> = {}
    headers.forEach((h, c) => {
      if (h) values[h] = cellToString(cells[c])
    })
    if (Object.values(values).some((v) => v !== '')) rows.push({ row: i + 2, values })
  })
  return { name, headers: headers.filter(Boolean), rows }
}

const sameName = (a: string, b: string) => normalizeHeader(a) === normalizeHeader(b)

/** Lee un .xlsx (ArrayBuffer) y devuelve las hojas Productos / Variantes / Especificaciones normalizadas. */
export async function parseWorkbook(data: ArrayBuffer): Promise<ParsedWorkbook> {
  // SheetJS pesa bastante: se carga solo cuando se importa un archivo.
  const XLSX = await import('xlsx')
  const wb = XLSX.read(data, { type: 'array', cellDates: true })
  const read = (expected: string): ParsedSheet | undefined => {
    const name = wb.SheetNames.find((n) => sameName(n, expected))
    if (!name) return undefined
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], {
      header: 1,
      raw: true,
      defval: '',
    })
    return matrixToSheet(name, matrix)
  }
  return {
    products: read(SHEET_NAMES.products),
    variants: read(SHEET_NAMES.variants),
    specs: read(SHEET_NAMES.specs),
  }
}
