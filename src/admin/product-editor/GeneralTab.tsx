import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { getCategories, getCategory, getSubcategories } from '@/services/catalogService'
import { Card } from './Card'
import type { TabProps } from './types'

export function GeneralTab({ draft, set }: TabProps) {
  const category = getCategory(draft.categoryId)
  const subs = category ? getSubcategories(category) : []
  return (
    <>
      <Card title="Información básica">
        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <TextField
            className="min-[700px]:col-span-2"
            label="Nombre del producto"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej.: Taladro percutor 20V, Zapatillas running, Notebook 15”"
          />
          <TextField
            label="Marca"
            value={draft.brand}
            onChange={(e) => set('brand', e.target.value)}
          />
          <TextField
            label="Palabras clave (separadas por coma)"
            value={draft.keywords}
            onChange={(e) => set('keywords', e.target.value)}
            hint="Ayudan a que lo encuentren en el buscador."
          />
          <SelectField
            label="Categoría"
            value={draft.categoryId}
            onChange={(e) => {
              set('categoryId', e.target.value)
              set('subcategoryId', '')
            }}
          >
            <option value="">Elegí una categoría</option>
            {getCategories().map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Subcategoría"
            value={draft.subcategoryId}
            onChange={(e) => set('subcategoryId', e.target.value)}
            disabled={!category}
          >
            <option value="">
              {category ? 'Elegí una subcategoría' : 'Primero elegí la categoría'}
            </option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      <Card title="Descripción">
        <div className="flex flex-col gap-4">
          <TextField
            label="Descripción corta"
            maxLength={160}
            value={draft.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
            hint={`${draft.shortDescription.length}/160 · aparece en las tarjetas y en el buscador`}
          />
          <TextAreaField
            label="Descripción completa"
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
            className=""
            rows={6}
          />
        </div>
      </Card>

      <Card title="Visibilidad">
        <Switch
          checked={draft.status === 'activo'}
          onChange={(on) => set('status', on ? 'activo' : 'borrador')}
          label={
            draft.status === 'activo' ? 'Publicado en la tienda' : 'Borrador (oculto en la tienda)'
          }
          description="Los borradores no se muestran a los clientes."
        />
      </Card>
    </>
  )
}
