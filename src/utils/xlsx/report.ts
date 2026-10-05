import type { ImportIssue } from './types'

const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

/** CSV (con BOM para que Excel respete los acentos) con todos los problemas encontrados. */
export function buildErrorReport(issues: ImportIssue[]): string {
  const rows = [
    ['Severidad', 'Hoja', 'Fila', 'Columna', 'Mensaje'],
    ...issues.map((i) => [
      i.severity === 'error' ? 'Error' : 'Advertencia',
      i.sheet,
      i.row || '',
      i.column ?? '',
      i.message,
    ]),
  ]
  return '﻿' + rows.map((r) => r.map(quote).join(',')).join('\r\n')
}
