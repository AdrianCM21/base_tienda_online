import { Plus, Ticket, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Drawer } from '@/components/ui/Drawer'
import { SelectField, TextField } from '@/components/ui/FormField'
import couponsData from '@/data/coupons.json'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/useToast'
import { useVisitedPage } from '@/hooks/useVisitedPage'
import { getCategories, getCategory } from '@/services/catalogService'
import type { Coupon, CouponStatus } from '@/types/coupon'
import {
  blankCouponDraft,
  COUPON_KINDS,
  couponStatus,
  describeCoupon,
  draftToCoupon,
  validateCouponDraft,
  type CouponDraft,
  type CouponErrors,
} from '@/utils/coupons'
import { formatNumber } from '@/utils/format'
import { AdminPageHeader } from './AdminPageHeader'
import { StatCard } from './StatCard'
import { StatusBadge } from './StatusBadge'

const STATUS: Record<
  CouponStatus,
  { label: string; tone: 'green' | 'blue' | 'gray' | 'red' | 'amber' }
> = {
  activo: { label: 'Activo', tone: 'green' },
  programado: { label: 'Programado', tone: 'blue' },
  vencido: { label: 'Vencido', tone: 'gray' },
  agotado: { label: 'Agotado', tone: 'red' },
  pausado: { label: 'Pausado', tone: 'amber' },
}
const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
const digits = (s: string) => s.replace(/\D/g, '')

export default function CouponsPage() {
  useVisitedPage('cupones')
  const { price } = useCurrency()
  const { toast } = useToast()
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  // Los cambios viven solo en esta pantalla (se pierden al recargar).
  const [coupons, setCoupons] = useState<Coupon[]>(couponsData as Coupon[])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<CouponDraft>(() => blankCouponDraft(today))
  const [errors, setErrors] = useState<CouponErrors>({})

  const categoryName = (id: string) => getCategory(id)?.name
  const summary = useMemo(() => {
    const status = (c: Coupon) => couponStatus(c, today)
    return {
      active: coupons.filter((c) => status(c) === 'activo').length,
      scheduled: coupons.filter((c) => status(c) === 'programado').length,
      uses: coupons.reduce((n, c) => n + c.used, 0),
    }
  }, [coupons, today])

  const set = <K extends keyof CouponDraft>(key: K, value: CouponDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const openNew = () => {
    setDraft(blankCouponDraft(today))
    setErrors({})
    setOpen(true)
  }
  const create = () => {
    const found = validateCouponDraft(
      draft,
      coupons.map((c) => c.code),
    )
    setErrors(found)
    if (Object.keys(found).length) return
    setCoupons((cur) => [draftToCoupon(draft, `n${cur.length + 1}`), ...cur])
    setOpen(false)
    toast('Cupón creado (solo en esta pantalla)')
  }
  const toggle = (id: string, active: boolean) =>
    setCoupons((cur) => cur.map((c) => (c.id === id ? { ...c, active } : c)))

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Cupón',
      mobileLabel: false,
      sortValue: (c) => c.code,
      cell: (c) => (
        <div>
          <span className="rounded-[4px] bg-light px-2 py-0.5 font-mono text-[12.5px] font-bold text-dark">
            {c.code}
          </span>
          <span className="mt-1 block max-w-[300px] text-xs text-muted">
            {describeCoupon(c, price, categoryName)}
          </span>
        </div>
      ),
    },
    {
      key: 'uses',
      header: 'Usos',
      sortValue: (c) => c.used,
      cell: (c) => (
        <span className="whitespace-nowrap">
          {formatNumber(c.used)}
          <span className="text-subtle">
            {' '}
            / {c.usageLimit === null ? '∞' : formatNumber(c.usageLimit)}
          </span>
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Vigencia',
      sortValue: (c) => c.startsAt,
      cell: (c) => (
        <span className="whitespace-nowrap text-muted">
          {dmy(c.startsAt)} → {dmy(c.endsAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortValue: (c) => couponStatus(c, today),
      cell: (c) => (
        <StatusBadge tone={STATUS[couponStatus(c, today)].tone}>
          {STATUS[couponStatus(c, today)].label}
        </StatusBadge>
      ),
    },
    {
      key: 'active',
      header: 'Activo',
      align: 'right',
      cell: (c) => (
        <button
          type="button"
          role="switch"
          aria-checked={c.active}
          aria-label={`${c.active ? 'Pausar' : 'Activar'} el cupón ${c.code}`}
          onClick={() => toggle(c.id, !c.active)}
          className={`relative h-6 w-11 rounded-full transition-colors ${c.active ? 'bg-primary' : 'bg-neutral-300'}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${c.active ? 'translate-x-5' : ''}`}
          />
        </button>
      ),
    },
  ]

  const preview = draft.code.trim()
    ? describeCoupon(
        {
          kind: draft.kind,
          value: Number(draft.value) || 0,
          minPurchase: Number(draft.minPurchase) || 0,
          appliesTo: draft.appliesTo,
        },
        price,
        categoryName,
      )
    : ''

  return (
    <>
      <AdminPageHeader
        title="Cupones"
        description="Códigos de descuento para tus clientes. Podés crear uno y pausarlo en pantalla; en la demo no se guardan ni se aplican en el checkout."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus size={16} aria-hidden="true" />
            Nuevo cupón
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <StatCard
          label="Cupones activos"
          value={String(summary.active)}
          icon={<Ticket size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Programados"
          value={String(summary.scheduled)}
          hint="Empiezan más adelante"
          icon={<Ticket size={16} aria-hidden="true" />}
        />
        <StatCard
          label="Usos totales"
          value={formatNumber(summary.uses)}
          icon={<Ticket size={16} aria-hidden="true" />}
        />
      </div>

      <DataTable
        rows={coupons}
        columns={columns}
        getRowId={(c) => c.id}
        caption="Cupones de descuento"
        noun="cupones"
        initialSort={{ key: 'validity', dir: 'desc' }}
      />

      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Nuevo cupón">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create()
          }}
          noValidate
          className="flex flex-col gap-4 p-5"
        >
          <TextField
            label="Código"
            value={draft.code}
            onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
            error={errors.code}
            maxLength={20}
            placeholder="Ej.: VERANO20"
            hint="Lo escribe el cliente en el checkout."
          />
          <SelectField
            label="Tipo de descuento"
            value={draft.kind}
            onChange={(e) => set('kind', e.target.value as CouponDraft['kind'])}
          >
            {COUPON_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </SelectField>
          {draft.kind !== 'free-shipping' && (
            <TextField
              label={draft.kind === 'percent' ? 'Porcentaje (%)' : 'Monto (Gs.)'}
              inputMode="numeric"
              value={draft.value}
              onChange={(e) => set('value', digits(e.target.value))}
              error={errors.value}
            />
          )}
          <TextField
            label="Compra mínima (Gs.)"
            inputMode="numeric"
            value={draft.minPurchase}
            onChange={(e) => set('minPurchase', digits(e.target.value))}
            hint="Vacío = sin mínimo."
          />
          <TextField
            label="Límite de usos"
            inputMode="numeric"
            value={draft.usageLimit}
            onChange={(e) => set('usageLimit', digits(e.target.value))}
            error={errors.usageLimit}
            hint="Vacío = ilimitado."
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Desde"
              type="date"
              value={draft.startsAt}
              onChange={(e) => set('startsAt', e.target.value)}
              error={errors.startsAt}
            />
            <TextField
              label="Hasta"
              type="date"
              value={draft.endsAt}
              onChange={(e) => set('endsAt', e.target.value)}
              error={errors.endsAt}
            />
          </div>
          <SelectField
            label="Aplica a"
            value={draft.appliesTo}
            onChange={(e) => set('appliesTo', e.target.value)}
          >
            <option value="todos">Toda la tienda</option>
            {getCategories().map((c) => (
              <option key={c.id} value={c.id}>
                Solo {c.name}
              </option>
            ))}
          </SelectField>

          <div aria-live="polite" className="rounded-card bg-light px-4 py-3 text-[13px]">
            <span className="block text-xs font-semibold text-muted">Así lo ve el cliente</span>
            {preview ? (
              <span className="mt-1 block font-semibold text-dark">
                <span className="rounded-[4px] bg-white px-1.5 py-0.5 font-mono">{draft.code}</span>{' '}
                — {preview}
              </span>
            ) : (
              <span className="mt-1 flex items-center gap-1.5 text-muted">
                <TriangleAlert size={14} aria-hidden="true" />
                Escribí un código para ver la vista previa.
              </span>
            )}
          </div>
          <Button type="submit">Crear cupón</Button>
        </form>
      </Drawer>
    </>
  )
}
