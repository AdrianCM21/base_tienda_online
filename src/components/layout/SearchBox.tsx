import { Search } from 'lucide-react'
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paths } from '@/config/routes'
import { useCurrency } from '@/hooks/useCurrency'
import { useDebounce } from '@/hooks/useDebounce'
import { searchSuggestions } from '@/services/catalogService'

/** Buscador del header con sugerencias (combobox accesible). */
export function SearchBox() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { price } = useCurrency()
  const [value, setValue] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  const debounced = useDebounce(value, 150)
  const suggestions = open ? searchSuggestions(debounced, 5) : []
  const showList = open && suggestions.length > 0

  const go = (to: string) => {
    setOpen(false)
    setActive(-1)
    navigate(to)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (active >= 0 && suggestions[active]) return go(paths.product(suggestions[active].slug))
    go(paths.search(value.trim()))
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault()
      setActive((a) => (a + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault()
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative order-last max-w-[640px] min-w-[120px] basis-full sm:order-none sm:flex-[1_1_200px] sm:basis-auto"
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <form
        role="search"
        onSubmit={submit}
        className="flex overflow-hidden rounded-search bg-white"
      >
        <input
          type="search"
          aria-label="Buscar productos"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Buscar productos, marcas y más..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 border-none px-4 py-3 text-sm text-text outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="flex shrink-0 items-center justify-center bg-primary px-[18px] text-white transition-colors hover:bg-primary-hover"
        >
          <Search size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>
      <ul
        id={listId}
        role="listbox"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-40 m-0 mt-1 list-none overflow-hidden rounded-card border border-light bg-white p-0 shadow-card-hover"
      >
        {suggestions.map((p, i) => (
          <li
            key={p.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => go(paths.product(p.slug))}
            className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[13.5px] ${i === active ? 'bg-light' : 'hover:bg-light'}`}
          >
            <span className="truncate text-text">{p.name}</span>
            <span className="shrink-0 font-bold text-primary">{price(p.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
