import { Menu } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CategorySidebar } from '../catalog/CategorySidebar'
import { Drawer } from '../ui/Drawer'

/** Botón + drawer con las categorías; visible solo por debajo de 900px. */
export function CategoriesDrawer() {
  const { key } = useLocation()
  return <CategoriesDrawerInner key={key} />
}

function CategoriesDrawerInner() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <div className="border-b border-light bg-white px-6 py-3 min-[900px]:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-control border border-light px-3.5 py-2 text-[13.5px] font-semibold text-dark hover:bg-light"
      >
        <Menu size={18} aria-hidden="true" />
        Categorías
      </button>
      <Drawer open={open} onClose={close} title="Categorías">
        <CategorySidebar embedded />
      </Drawer>
    </div>
  )
}
