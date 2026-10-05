import { ImagePlus, Star, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, type DragEvent } from 'react'
import { ProductImage } from '@/components/catalog/ProductImage'
import { Card } from './Card'
import type { TabProps } from './types'

/** Carga de imágenes de muestra: se previsualizan en el navegador y no se suben a ningún lado. */
export function ImagesTab({ draft, set }: TabProps) {
  const inputId = useId()
  const created = useRef<string[]>([])

  useEffect(() => {
    const urls = created.current
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const add = (files: FileList | File[]) => {
    const urls = [...files]
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        const u = URL.createObjectURL(f)
        created.current.push(u)
        return u
      })
    if (urls.length) set('images', [...draft.images, ...urls])
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    add(e.dataTransfer.files)
  }
  const makeMain = (i: number) =>
    set('images', [draft.images[i], ...draft.images.filter((_, k) => k !== i)])

  return (
    <Card
      title="Imágenes"
      hint="La primera es la principal. Recomendado: fondo claro, al menos 800 × 800 px. En esta demo las imágenes solo se previsualizan."
    >
      <label
        htmlFor={inputId}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex cursor-pointer flex-col items-center rounded-card border-2 border-dashed border-subtle px-6 py-8 text-center hover:bg-light focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
      >
        <ImagePlus size={28} className="mb-2 text-primary" aria-hidden="true" />
        <span className="text-[14px] font-bold">
          Arrastrá las fotos acá o hacé clic para elegirlas
        </span>
        <span className="text-xs text-muted">JPG, PNG o WebP</span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && add(e.target.files)}
        />
      </label>

      {draft.images.length === 0 ? (
        <div className="mt-4 flex items-center gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-card border border-light">
            <ProductImage alt="" tint={draft.colors[0]?.hex} />
          </div>
          <p className="m-0 text-[13px] text-muted">
            Sin imágenes: la tienda mostrará una imagen de reemplazo con el color del producto.
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-4 grid list-none grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 p-0">
          {draft.images.map((src, i) => (
            <li
              key={src}
              className="relative overflow-hidden rounded-card border border-light bg-white"
            >
              <img
                src={src}
                alt={`Imagen ${i + 1} del producto`}
                className="h-28 w-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-[4px] bg-primary px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                  PRINCIPAL
                </span>
              )}
              <div className="flex justify-between border-t border-light px-1.5 py-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => makeMain(i)}
                  aria-label={`Hacer principal la imagen ${i + 1}`}
                  className="rounded-control p-1.5 text-muted hover:bg-light hover:text-dark disabled:opacity-30"
                >
                  <Star size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'images',
                      draft.images.filter((_, k) => k !== i),
                    )
                  }
                  aria-label={`Quitar la imagen ${i + 1}`}
                  className="rounded-control p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
