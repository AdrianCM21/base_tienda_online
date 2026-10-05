import type { Product } from '@/types/product'

export type Severity = 'error' | 'warning'

/** Problema detectado al validar el archivo, ubicado por hoja, fila y columna. */
export type ImportIssue = {
  severity: Severity
  sheet: string
  /** Número de fila tal como se ve en Excel (1 = encabezados, 0 = el archivo/hoja completo). */
  row: number
  column?: string
  message: string
}

export type ParsedRow = { row: number; values: Record<string, string> }

export type ParsedSheet = {
  name: string
  headers: string[]
  rows: ParsedRow[]
}

/** Contenido del libro ya normalizado a texto, listo para validar (sin dependencia de SheetJS). */
export type ParsedWorkbook = {
  products?: ParsedSheet
  variants?: ParsedSheet
  specs?: ParsedSheet
}

export type ImportCounts = {
  /** Filas leídas en la hoja Productos. */
  productRows: number
  /** Productos válidos que se importarían. */
  products: number
  variants: number
  specs: number
  errors: number
  warnings: number
}

export type ImportResult = {
  products: Product[]
  issues: ImportIssue[]
  counts: ImportCounts
}
