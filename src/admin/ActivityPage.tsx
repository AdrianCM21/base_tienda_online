import { Download, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { useActivity } from '@/hooks/useActivity'
import { useToast } from '@/hooks/useToast'
import { toCsv } from '@/utils/adminExport'
import {
  ACTIVITY_LABEL,
  clearActivity,
  type ActivityEntry,
  type ActivityKind,
} from '@/utils/activityLog'
import { downloadBlob } from '@/utils/download'
import { formatDateTime } from '@/utils/format'
import { normalizeText } from '@/utils/text'
import { AdminPageHeader } from './AdminPageHeader'
import { StatusBadge } from './StatusBadge'

const KINDS = Object.keys(ACTIVITY_LABEL) as ActivityKind[]
const TONE: Record<ActivityKind, 'blue' | 'green' | 'amber' | 'gray'> = {
  pedido: 'blue',
  producto: 'green',
  marketing: 'amber',
  sesion: 'gray',
  exportacion: 'gray',
  configuracion: 'amber',
}

export default function ActivityPage() {
  const { entries } = useActivity()
  const { toast } = useToast()
  const [kind, setKind] = useState<'todas' | ActivityKind>('todas')
  const [q, setQ] = useState('')

  const mine = entries.filter((e) => e.mine).length
  const filtered = useMemo(() => {
    const nq = normalizeText(q)
    return entries.filter(
      (e) =>
        (kind === 'todas' || e.kind === kind) &&
        (!nq || normalizeText(`${e.message} ${e.user}`).includes(nq)),
    )
  }, [entries, kind, q])

  const exportCsv = () =>
    downloadBlob(
      toCsv([
        ['Fecha', 'Usuario', 'Tipo', 'Acción'],
        ...filtered.map((e) => [e.at, e.user, ACTIVITY_LABEL[e.kind], e.message]),
      ]),
      'actividad.csv',
      'text/csv;charset=utf-8',
    )

  const columns: Column<ActivityEntry>[] = [
    {
      key: 'at',
      header: 'Fecha',
      sortValue: (e) => e.at,
      cell: (e) => <span className="whitespace-nowrap text-muted">{formatDateTime(e.at)}</span>,
    },
    { key: 'user', header: 'Usuario', sortValue: (e) => e.user, cell: (e) => e.user },
    {
      key: 'kind',
      header: 'Tipo',
      sortValue: (e) => ACTIVITY_LABEL[e.kind],
      cell: (e) => <StatusBadge tone={TONE[e.kind]}>{ACTIVITY_LABEL[e.kind]}</StatusBadge>,
    },
    {
      key: 'message',
      header: 'Acción',
      mobileLabel: false,
      cell: (e) => (
        <span>
          {e.to ? (
            <Link to={e.to} className="font-semibold">
              {e.message}
            </Link>
          ) : (
            e.message
          )}
          {e.mine && (
            <span className="ml-2 rounded-[4px] bg-primary px-1.5 py-0.5 text-[10.5px] font-bold text-white">
              TU ACCIÓN
            </span>
          )}
        </span>
      ),
    },
  ]

  return (
    <>
      <AdminPageHeader
        title="Actividad"
        description="Quién hizo qué en el panel. Las acciones que hagas en esta demo se suman al historial de ejemplo."
        actions={
          <>
            {mine > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearActivity()
                  toast('Se borraron tus acciones del registro')
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                Borrar mis acciones
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download size={16} aria-hidden="true" />
              Exportar CSV
            </Button>
          </>
        }
      />

      <div role="group" aria-label="Filtrar por tipo" className="mb-4 flex flex-wrap gap-1.5">
        {(['todas', ...KINDS] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold ${kind === k ? 'border-primary bg-primary text-white' : 'border-light bg-white text-dark hover:bg-light'}`}
          >
            {k === 'todas' ? 'Todas' : ACTIVITY_LABEL[k]}
          </button>
        ))}
      </div>
      <label className="relative mb-4 block max-w-[460px]">
        <span className="sr-only">Buscar en la actividad</span>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por acción o usuario"
          className="w-full rounded-control border border-light bg-white py-2.5 pr-3 pl-9 text-[13.5px]"
        />
      </label>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(e) => e.id}
        caption="Registro de actividad"
        noun="acciones"
        initialSort={{ key: 'at', dir: 'desc' }}
        empty={
          <EmptyState
            icon={<Search size={26} aria-hidden="true" />}
            title="Ninguna acción coincide"
          >
            Probá con otra búsqueda o cambiá el tipo.
          </EmptyState>
        }
      />
    </>
  )
}
