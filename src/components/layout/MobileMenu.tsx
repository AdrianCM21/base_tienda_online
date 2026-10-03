import { Menu } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CategorySidebar } from '../catalog/CategorySidebar'
import { Drawer } from '../ui/Drawer'

/** Botón de menú (junto al logo) que abre las categorías en un drawer; solo por debajo de 900px. */
export function MobileMenu() {
  // Al navegar cambia `key` y el componente se reinicia: el menú se cierra solo.
  const { key } = useLocation()
  return <MobileMenuInner key={key} />
}

function MobileMenuInner() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú de categorías"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-white hover:bg-white/10 min-[900px]:hidden"
      >
        <Menu size={26} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <Drawer open={open} onClose={close} title="Categorías">
        <CategorySidebar embedded />
      </Drawer>
    </>
  )
}
