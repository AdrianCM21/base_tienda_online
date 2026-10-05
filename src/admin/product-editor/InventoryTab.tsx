import { SelectField, TextField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { UNITS } from '@/utils/productDraft'
import { Card } from './Card'
import type { TabProps } from './types'

const digits = (s: string) => s.replace(/\D/g, '')

export function InventoryTab({ draft, set }: TabProps) {
  const total =
    draft.hasVariants && draft.colors.length
      ? draft.colors.reduce((n, c) => n + Number(c.stock || 0), 0)
      : Number(draft.stock || 0)
  const low = Number(draft.lowStockAlert || 0)
  return (
    <>
      <Card title="Identificación">
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <TextField
            label="SKU (código interno)"
            value={draft.sku}
            onChange={(e) => set('sku', e.target.value)}
            hint="Es la clave que usa el importador de Excel."
          />
          <SelectField
            label="Unidad de venta"
            value={draft.unit}
            onChange={(e) => set('unit', e.target.value)}
            hint="Se vende por unidad, par, metro, kilo, caja…"
          >
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </SelectField>
        </div>
      </Card>

      <Card title="Stock">
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <TextField
            label="Cantidad disponible"
            inputMode="numeric"
            value={draft.hasVariants && draft.colors.length ? String(total) : draft.stock}
            disabled={draft.hasVariants && draft.colors.length > 0}
            onChange={(e) => set('stock', digits(e.target.value))}
            hint={
              draft.hasVariants && draft.colors.length > 0
                ? 'Con variantes, el stock es la suma de cada color.'
                : undefined
            }
          />
          <TextField
            label="Avisar cuando queden menos de"
            inputMode="numeric"
            value={draft.lowStockAlert}
            onChange={(e) => set('lowStockAlert', digits(e.target.value))}
          />
        </div>
        <p
          role="status"
          className={`mt-4 mb-0 rounded-control px-3.5 py-2.5 text-[13px] font-semibold ${total === 0 ? 'bg-red-50 text-red-800' : total <= low ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-800'}`}
        >
          {total === 0
            ? 'Sin stock: la tienda mostrará el producto como agotado.'
            : total <= low
              ? `Stock bajo: ${total} ${draft.unit.toLowerCase()}(s) disponibles.`
              : `Stock saludable: ${total} disponibles.`}
        </p>
        <div className="mt-3">
          <Switch
            checked={draft.allowBackorder}
            onChange={(v) => set('allowBackorder', v)}
            label="Permitir comprar sin stock"
            description="Útil para productos que se piden al proveedor."
          />
        </div>
      </Card>
    </>
  )
}
