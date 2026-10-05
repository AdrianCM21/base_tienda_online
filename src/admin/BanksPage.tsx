import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { BankCard } from '@/components/home/BankCard'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { TextField } from '@/components/ui/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/hooks/useToast'
import { getBanks } from '@/services/catalogService'
import type { Bank } from '@/types/bank'
import { AdminPageHeader } from './AdminPageHeader'
import { Landmark } from 'lucide-react'

type Item = Bank & { visible: boolean }
type Form = { name: string; benefit: string; condition: string }
const blank: Form = { name: '', benefit: '', condition: '' }

export default function BanksPage() {
  const { toast } = useToast()
  // Cambios solo en pantalla: la Home de la tienda sigue mostrando los beneficios originales.
  const [items, setItems] = useState<Item[]>(() => getBanks().map((b) => ({ ...b, visible: true })))
  const [editing, setEditing] = useState<{ id: string | null } | null>(null)
  const [form, setForm] = useState<Form>(blank)
  const [error, setError] = useState('')
  const formId = useId()

  const openNew = () => {
    setForm(blank)
    setError('')
    setEditing({ id: null })
  }
  const openEdit = (b: Item) => {
    setForm({ name: b.name, benefit: b.benefit, condition: b.condition })
    setError('')
    setEditing({ id: b.id })
  }
  const save = () => {
    if (!form.name.trim() || !form.benefit.trim())
      return setError(
        'Completá el nombre del banco y el beneficio (por ejemplo "15% OFF" o "12 cuotas").',
      )
    if (editing?.id)
      setItems((cur) => cur.map((b) => (b.id === editing.id ? { ...b, ...form } : b)))
    else setItems((cur) => [...cur, { id: `nuevo-${cur.length + 1}`, ...form, visible: true }])
    setEditing(null)
    toast('Beneficio guardado (solo en esta pantalla)')
  }
  const visible = items.filter((b) => b.visible)

  return (
    <>
      <AdminPageHeader
        title="Beneficios con bancos"
        description="Descuentos y cuotas especiales que se muestran en la Home. Podés editarlos y ocultarlos en pantalla; en la demo no se guardan."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus size={16} aria-hidden="true" />
            Agregar beneficio
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-[minmax(0,420px)_1fr]">
        <section aria-labelledby="lista-titulo" className="min-w-0">
          <h2 id="lista-titulo" className="mb-3 font-sans text-[15px] font-bold">
            Tus beneficios ({items.length})
          </h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {items.map((b) => (
              <li key={b.id} className="rounded-card border border-light bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 truncate font-semibold">{b.name}</p>
                    <p className="m-0 text-[13px] text-muted">
                      {b.benefit} · {b.condition}
                    </p>
                  </div>
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      aria-label={`Editar ${b.name}`}
                      className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark"
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((cur) => cur.filter((x) => x.id !== b.id))}
                      aria-label={`Quitar ${b.name}`}
                      className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <Switch
                  checked={b.visible}
                  onChange={(v) =>
                    setItems((cur) => cur.map((x) => (x.id === b.id ? { ...x, visible: v } : x)))
                  }
                  label={`Mostrar ${b.name} en la tienda`}
                />
              </li>
            ))}
          </ul>
          {items.length === 0 && (
            <EmptyState icon={<Landmark size={26} aria-hidden="true" />} title="No hay beneficios">
              Agregá el primero para mostrarlo en la Home.
            </EmptyState>
          )}
        </section>

        <section aria-labelledby="preview-titulo" className="min-w-0 rounded-card bg-light p-5">
          <h2 id="preview-titulo" className="mb-1 text-[22px] font-bold">
            Beneficios con tu banco o cooperativa
          </h2>
          <p className="mt-0 mb-1 text-xs font-semibold text-muted">Vista previa de la Home</p>
          <p className="mt-0 mb-5 text-[14px] text-muted">
            Descuentos y cuotas especiales todos los meses.
          </p>
          {visible.length === 0 ? (
            <p className="m-0 text-[13.5px] text-muted">
              No hay beneficios visibles: la sección se vería vacía.
            </p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 p-0">
              {visible.map((b) => (
                <BankCard key={b.id} bank={b} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        side="right"
        title={editing?.id ? 'Editar beneficio' : 'Nuevo beneficio'}
      >
        <form
          id={formId}
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          className="flex flex-col gap-4 p-5"
        >
          <TextField
            label="Banco o cooperativa"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Beneficio destacado"
            value={form.benefit}
            onChange={(e) => setForm({ ...form, benefit: e.target.value })}
            placeholder="15% OFF · 12 cuotas"
            hint="Es lo que se ve en grande en la tarjeta."
          />
          <TextField
            label="Condición"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            placeholder="Los martes, tope Gs. 300.000"
          />
          {error && (
            <p role="alert" className="m-0 text-[12.5px] font-semibold text-red-700">
              {error}
            </p>
          )}
          <div
            aria-label="Vista previa de la tarjeta"
            role="group"
            className="rounded-card bg-light p-3"
          >
            <ul className="m-0 list-none p-0">
              <BankCard
                bank={{
                  name: form.name || 'Nombre del banco',
                  benefit: form.benefit || '— —',
                  condition: form.condition || 'Condición del beneficio',
                }}
              />
            </ul>
          </div>
          <Button type="submit">Guardar beneficio</Button>
        </form>
      </Drawer>
    </>
  )
}
