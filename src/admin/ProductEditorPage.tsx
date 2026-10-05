import { Copy, ExternalLink, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/button-styles'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tabs } from '@/components/ui/Tabs'
import { adminPaths, paths } from '@/config/routes'
import { useDemoNotice } from '@/hooks/useDemoNotice'
import { getAllProductsIncludingDrafts } from '@/services/catalogService'
import { blankDraft, toDraft, type ProductDraft } from '@/utils/productDraft'
import { AdminPageHeader } from './AdminPageHeader'
import { StatusBadge } from './StatusBadge'
import { GeneralTab } from './product-editor/GeneralTab'
import { ImagesTab } from './product-editor/ImagesTab'
import { InventoryTab } from './product-editor/InventoryTab'
import { PricingTab } from './product-editor/PricingTab'
import { SeoTab } from './product-editor/SeoTab'
import { SpecsTab } from './product-editor/SpecsTab'
import type { SetDraft } from './product-editor/types'
import { VariantsTab } from './product-editor/VariantsTab'
import { Package } from 'lucide-react'

export default function ProductEditorPage() {
  const { id } = useParams()
  const isNew = id === undefined
  const product = useMemo(
    () => (isNew ? undefined : getAllProductsIncludingDrafts().find((p) => p.id === id)),
    [id, isNew],
  )

  if (!isNew && !product) {
    return (
      <EmptyState
        icon={<Package size={26} aria-hidden="true" />}
        title="No encontramos ese producto"
        action={
          <Link to={adminPaths.products} className={buttonClasses('primary')}>
            Volver a Productos
          </Link>
        }
      >
        Puede que el enlace sea viejo o que el producto ya no exista.
      </EmptyState>
    )
  }
  // `key` reinicia el borrador al cambiar de producto.
  return (
    <Editor
      key={id ?? 'nuevo'}
      initial={product ? toDraft(product) : blankDraft()}
      slug={product?.slug}
      isNew={isNew}
    />
  )
}

function Editor({
  initial,
  slug,
  isNew,
}: {
  initial: ProductDraft
  slug?: string
  isNew: boolean
}) {
  const notice = useDemoNotice('Los cambios no se guardan: es una demostración')
  const removeNotice = useDemoNotice('No se puede eliminar en la demo')
  const duplicateNotice = useDemoNotice('Duplicar no está disponible en la demo')
  const [baseline] = useState(() => JSON.stringify(initial))
  const [draft, setDraft] = useState(initial)
  const dirty = JSON.stringify(draft) !== baseline

  const set: SetDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const props = { draft, set }

  return (
    <>
      <AdminPageHeader
        back={{ label: 'Productos', to: adminPaths.products }}
        title={isNew ? 'Nuevo producto' : draft.name || 'Producto sin nombre'}
        description={
          isNew
            ? 'Completá los datos. En la demo no se guarda.'
            : `SKU ${draft.sku} · cambios solo de muestra`
        }
        actions={
          <>
            <StatusBadge tone={draft.status === 'activo' ? 'green' : 'gray'}>
              {draft.status === 'activo' ? 'Publicado' : 'Borrador'}
            </StatusBadge>
            {slug && (
              <Link to={paths.product(slug)} className={buttonClasses('outline', 'sm')}>
                <ExternalLink size={15} aria-hidden="true" />
                Ver en la tienda
              </Link>
            )}
            {!isNew && (
              <>
                <Button variant="outline" size="sm" onClick={duplicateNotice}>
                  <Copy size={15} aria-hidden="true" />
                  Duplicar
                </Button>
                <Button variant="outline" size="sm" onClick={removeNotice}>
                  <Trash2 size={15} aria-hidden="true" />
                  Eliminar
                </Button>
              </>
            )}
            <Button size="sm" onClick={notice}>
              <Save size={15} aria-hidden="true" />
              Guardar
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: 'general', label: 'General', content: <GeneralTab {...props} /> },
          { id: 'precios', label: 'Precios y ofertas', content: <PricingTab {...props} /> },
          { id: 'inventario', label: 'Inventario', content: <InventoryTab {...props} /> },
          { id: 'variantes', label: 'Variantes', content: <VariantsTab {...props} /> },
          { id: 'imagenes', label: 'Imágenes', content: <ImagesTab {...props} /> },
          { id: 'especificaciones', label: 'Especificaciones', content: <SpecsTab {...props} /> },
          { id: 'seo', label: 'SEO', content: <SeoTab {...props} /> },
        ]}
      />

      {dirty && (
        <div
          role="region"
          aria-label="Cambios sin guardar"
          className="sticky bottom-4 z-30 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-900 shadow-card-hover"
        >
          Tenés cambios sin guardar
          <span className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDraft(initial)}>
              Descartar
            </Button>
            <Button size="sm" onClick={notice}>
              Guardar cambios
            </Button>
          </span>
        </div>
      )}
    </>
  )
}
