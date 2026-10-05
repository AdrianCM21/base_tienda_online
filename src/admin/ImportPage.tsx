import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { useId, useMemo, useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/button-styles'
import { Tabs } from '@/components/ui/Tabs'
import { adminPaths } from '@/config/routes'
import { getAllProductsIncludingDrafts, getCategories } from '@/services/catalogService'
import { downloadBlob } from '@/utils/download'
import { readFileAsArrayBuffer } from '@/utils/readFile'
import { parseWorkbook } from '@/utils/xlsx/parse'
import { IMPORT_MODES, planImport, type ImportMode, type ImportPlan } from '@/utils/xlsx/plan'
import { buildErrorReport } from '@/utils/xlsx/report'
import { buildTemplate } from '@/utils/xlsx/template'
import type { ImportResult, ParsedWorkbook } from '@/utils/xlsx/types'
import { validateWorkbook } from '@/utils/xlsx/validate'
import { AdminPageHeader } from './AdminPageHeader'
import { IssuesTable, ProductsPreview, RawTable } from './import/ImportTables'

const MAX_BYTES = 5 * 1024 * 1024
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

type Done = { fileName: string; nuevo: number; actualizado: number }

type State =
  | { kind: 'idle' }
  | { kind: 'reading'; fileName: string }
  | { kind: 'failed'; message: string }
  | { kind: 'ready'; fileName: string; workbook: ParsedWorkbook; result: ImportResult }
  | ({ kind: 'importing' } & Done)
  | ({ kind: 'imported' } & Done)

function Summary({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'red' | 'amber' | 'green'
}) {
  const color =
    tone === 'red' && value > 0
      ? 'text-red-700'
      : tone === 'amber' && value > 0
        ? 'text-amber-700'
        : tone === 'green'
          ? 'text-emerald-700'
          : 'text-text'
  return (
    <div className="rounded-card border border-light bg-white px-4 py-3">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

export default function ImportPage() {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [dragging, setDragging] = useState(false)
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx'))
      return setState({
        kind: 'failed',
        message: 'El archivo debe ser un Excel .xlsx. Descargá la plantilla para ver el formato.',
      })
    if (file.size > MAX_BYTES)
      return setState({ kind: 'failed', message: 'El archivo supera los 5 MB.' })
    setState({ kind: 'reading', fileName: file.name })
    try {
      const workbook = await parseWorkbook(await readFileAsArrayBuffer(file))
      setState({
        kind: 'ready',
        fileName: file.name,
        workbook,
        result: validateWorkbook(workbook, getCategories()),
      })
    } catch {
      setState({
        kind: 'failed',
        message: 'No pudimos leer el archivo. Verificá que sea un .xlsx válido y no esté dañado.',
      })
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const downloadTemplate = async () =>
    downloadBlob(await buildTemplate(getCategories()), 'plantilla-productos.xlsx', XLSX_MIME)

  /** Importación simulada: muestra el resultado, pero el catálogo no se modifica. */
  const simulateImport = (done: Done) => {
    setState({ kind: 'importing', ...done })
    window.setTimeout(() => setState({ kind: 'imported', ...done }), 900)
  }

  const reset = () => {
    setState({ kind: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  const count =
    state.kind === 'importing' || state.kind === 'imported' ? state.nuevo + state.actualizado : 0

  return (
    <>
      <AdminPageHeader
        back={{ label: 'Productos', to: adminPaths.products }}
        title="Importar productos desde XLSX"
        description="Subí un archivo Excel con el formato de la plantilla: se valida y se muestra qué cambiaría. La importación es simulada."
        actions={
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download size={16} aria-hidden="true" />
            Descargar plantilla
          </Button>
        }
      />

      {(state.kind === 'idle' || state.kind === 'failed' || state.kind === 'reading') && (
        <>
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center rounded-card border-2 border-dashed px-6 py-14 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${dragging ? 'border-primary bg-light' : 'border-subtle bg-white hover:bg-light'}`}
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-light text-primary">
              {state.kind === 'reading' ? (
                <Loader2 size={26} className="animate-spin" aria-hidden="true" />
              ) : (
                <Upload size={26} aria-hidden="true" />
              )}
            </span>
            <span className="mb-1 text-base font-bold">
              {state.kind === 'reading'
                ? `Leyendo ${state.fileName}…`
                : 'Arrastrá tu archivo .xlsx acá'}
            </span>
            <span className="text-[13.5px] text-muted">
              o hacé clic para elegirlo (máximo 5 MB)
            </span>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept=".xlsx"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && void handleFile(e.target.files[0])}
            />
          </label>
          {state.kind === 'failed' && (
            <p
              role="alert"
              className="mt-3 mb-0 flex items-start gap-2 rounded-card bg-red-50 px-4 py-3 text-[13.5px] font-semibold text-red-800"
            >
              <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              {state.message}
            </p>
          )}
        </>
      )}

      {state.kind === 'ready' && (
        <ReadyView state={state} onReset={reset} onImport={simulateImport} />
      )}

      {state.kind === 'importing' && (
        <div
          role="status"
          className="flex items-center justify-center gap-3 rounded-card border border-light bg-white px-6 py-14 text-[15px] font-semibold"
        >
          <Loader2 size={20} className="animate-spin text-primary" aria-hidden="true" />
          Importando {count} productos…
        </div>
      )}

      {state.kind === 'imported' && (
        <div className="flex flex-col items-center rounded-card border border-light bg-white px-6 py-12 text-center">
          <CheckCircle2
            size={52}
            strokeWidth={1.5}
            className="mb-3 text-primary"
            aria-hidden="true"
          />
          <h2 className="mb-1 text-xl font-bold">¡{count} productos importados!</h2>
          <p className="m-0 mb-1 text-[13.5px] text-muted">
            {state.nuevo} {state.nuevo === 1 ? 'nuevo' : 'nuevos'} · {state.actualizado}{' '}
            {state.actualizado === 1 ? 'actualizado' : 'actualizados'} — archivo {state.fileName}
          </p>
          <p className="m-0 mb-5 max-w-[460px] text-[13.5px] font-semibold text-amber-800">
            Es una simulación: el catálogo de la demo no se modificó.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={adminPaths.products} className={buttonClasses('primary')}>
              Ver productos
            </Link>
            <Button variant="outline" onClick={reset}>
              Cargar otro archivo
            </Button>
          </div>
        </div>
      )}

      <section
        aria-labelledby="formato-titulo"
        className="mt-8 rounded-card border border-light bg-white p-5 text-[13.5px]"
      >
        <h2
          id="formato-titulo"
          className="mb-2 flex items-center gap-2 font-sans text-[15px] font-bold"
        >
          <FileSpreadsheet size={18} className="text-primary" aria-hidden="true" />
          Formato del archivo
        </h2>
        <ul className="m-0 list-disc pl-5 leading-relaxed text-muted">
          <li>
            <strong className="text-text">Productos</strong> (obligatoria): una fila por producto.
            Obligatorios: sku, nombre, marca, categoria, subcategoria, precio, stock,
            descripcion_corta, descripcion, imagen_principal.
          </li>
          <li>
            <strong className="text-text">Variantes</strong> (opcional): un color por fila (sku,
            color_nombre, color_hex, stock).
          </li>
          <li>
            <strong className="text-text">Especificaciones</strong> (opcional): sku, atributo,
            valor.
          </li>
          <li>
            La plantilla incluye una hoja <strong className="text-text">Instrucciones</strong> con
            todas las columnas y las categorías válidas. Con{' '}
            <strong className="text-text">Exportar catálogo</strong> (en Productos) obtenés tu
            catálogo actual en este mismo formato.
          </li>
        </ul>
      </section>
    </>
  )
}

function ReadyView({
  state,
  onReset,
  onImport,
}: {
  state: Extract<State, { kind: 'ready' }>
  onReset: () => void
  onImport: (done: Done) => void
}) {
  const { result, workbook, fileName } = state
  const { counts, issues } = result
  const [mode, setMode] = useState<ImportMode>('upsert')
  const modeId = useId()
  const plan: ImportPlan = useMemo(
    () => planImport(result.products, getAllProductsIncludingDrafts(), mode),
    [result.products, mode],
  )
  const p = plan.counts
  const canImport = counts.errors === 0 && p.applied > 0

  return (
    <div>
      <p className="mt-0 mb-3 text-[13.5px] text-muted">
        Archivo: <strong className="text-text">{fileName}</strong>
      </p>
      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
        <Summary label="Filas de productos" value={counts.productRows} />
        <Summary label="Productos válidos" value={counts.products} tone="green" />
        <Summary label="Errores" value={counts.errors} tone="red" />
        <Summary label="Avisos" value={counts.warnings} tone="amber" />
      </div>

      {counts.errors > 0 ? (
        <p
          role="alert"
          className="mt-0 mb-4 flex items-start gap-2 rounded-card bg-red-50 px-4 py-3 text-[13.5px] font-semibold text-red-800"
        >
          <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          Hay {counts.errors} {counts.errors === 1 ? 'error' : 'errores'}. Corregilos en el Excel y
          volvé a subir el archivo para poder importar.
        </p>
      ) : (
        <p
          role="status"
          className="mt-0 mb-4 flex items-start gap-2 rounded-card bg-emerald-50 px-4 py-3 text-[13.5px] font-semibold text-emerald-800"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          El archivo es válido: se pueden importar {counts.products} productos.
        </p>
      )}

      <fieldset className="m-0 mb-4 min-w-0 rounded-card border border-light bg-white p-4">
        <legend className="px-1 text-[13.5px] font-bold">¿Cómo querés importarlos?</legend>
        <div role="radiogroup" aria-label="Modo de importación" className="flex flex-col gap-1">
          {IMPORT_MODES.map((m) => (
            <label
              key={m.value}
              className="flex cursor-pointer items-start gap-2.5 rounded-control px-2 py-2 hover:bg-bg"
            >
              <input
                type="radio"
                name={modeId}
                className="mt-1 accent-primary"
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
              />
              <span>
                <span className="block text-[13.5px] font-semibold">{m.label}</span>
                <span className="block text-xs text-muted">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
        <p
          aria-live="polite"
          className="mt-3 mb-0 rounded-control bg-bg px-3 py-2 text-[13px] font-semibold"
        >
          Resultado: {p.nuevo} {p.nuevo === 1 ? 'nuevo' : 'nuevos'} · {p.actualizado}{' '}
          {p.actualizado === 1 ? 'actualizado' : 'actualizados'} · {p.sinCambios} sin cambios ·{' '}
          {p.omitido} {p.omitido === 1 ? 'omitido' : 'omitidos'}
        </p>
      </fieldset>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button
          disabled={!canImport}
          onClick={() => onImport({ fileName, nuevo: p.nuevo, actualizado: p.actualizado })}
        >
          Importar {p.applied} {p.applied === 1 ? 'producto' : 'productos'}
        </Button>
        {counts.errors === 0 && p.applied === 0 && (
          <span className="text-[13px] text-muted">No hay nada para aplicar con este modo.</span>
        )}
        {issues.length > 0 && (
          <Button
            variant="outline"
            onClick={() =>
              downloadBlob(
                buildErrorReport(issues),
                'problemas-importacion.csv',
                'text/csv;charset=utf-8',
              )
            }
          >
            <Download size={16} aria-hidden="true" />
            Descargar problemas (CSV)
          </Button>
        )}
        <Button variant="ghost" onClick={onReset}>
          Cargar otro archivo
        </Button>
      </div>

      <Tabs
        key={fileName}
        defaultId={counts.errors > 0 ? 'problemas' : 'productos'}
        tabs={[
          {
            id: 'problemas',
            label: `Problemas (${issues.length})`,
            content: <IssuesTable issues={issues} />,
          },
          {
            id: 'productos',
            label: `Productos (${counts.products})`,
            content: <ProductsPreview plan={plan} />,
          },
          {
            id: 'variantes',
            label: `Variantes (${counts.variants})`,
            content: <RawTable sheet={workbook.variants} />,
          },
          {
            id: 'especificaciones',
            label: `Especificaciones (${counts.specs})`,
            content: <RawTable sheet={workbook.specs} />,
          },
        ]}
      />
    </div>
  )
}
