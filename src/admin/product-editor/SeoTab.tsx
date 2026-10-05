import { TextAreaField, TextField } from '@/components/ui/FormField'
import { brand } from '@/config/brand'
import { productUrl } from '@/utils/productDraft'
import { Card } from './Card'
import type { TabProps } from './types'

export function SeoTab({ draft, set }: TabProps) {
  const title = draft.seoTitle || draft.name || 'Título del producto'
  const description =
    draft.seoDescription || draft.shortDescription || 'Descripción que verán los buscadores.'
  return (
    <>
      <Card
        title="Cómo aparece en Google"
        hint="Así se vería el producto en los resultados de un buscador."
      >
        <div className="rounded-card border border-light bg-white p-4">
          <p className="m-0 truncate text-[12.5px] text-emerald-800">{productUrl(draft.slug)}</p>
          <p className="m-0 mt-1 truncate text-[18px] text-[#1a0dab]">
            {title} · {brand.name}
          </p>
          <p className="m-0 mt-1 text-[13px] leading-snug text-muted">
            {description.slice(0, 160)}
          </p>
        </div>
      </Card>
      <Card title="Datos para buscadores">
        <div className="flex flex-col gap-4">
          <TextField
            label="Título SEO"
            maxLength={60}
            value={draft.seoTitle}
            onChange={(e) => set('seoTitle', e.target.value)}
            hint={`${draft.seoTitle.length}/60`}
          />
          <TextAreaField
            label="Meta descripción"
            maxLength={160}
            rows={3}
            className=""
            value={draft.seoDescription}
            onChange={(e) => set('seoDescription', e.target.value)}
            hint={`${draft.seoDescription.length}/160`}
          />
          <TextField
            label="Dirección (slug)"
            value={draft.slug}
            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
            hint={productUrl(draft.slug)}
          />
        </div>
      </Card>
    </>
  )
}
