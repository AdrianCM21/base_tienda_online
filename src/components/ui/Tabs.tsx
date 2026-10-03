import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export type TabItem = { id: string; label: string; content: ReactNode }

/** Pestañas accesibles (flechas, Home/End, tabindex itinerante). */
export function Tabs({
  tabs,
  defaultId,
  className = '',
}: {
  tabs: TabItem[]
  defaultId?: string
  className?: string
}) {
  const [active, setActive] = useState(defaultId ?? tabs[0].id)
  const base = useId()
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const move = (e: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    const next = tabs[keys[e.key]]
    setActive(next.id)
    refs.current[next.id]?.focus()
  }

  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  return (
    <div className={className}>
      <div role="tablist" className="mb-[22px] flex gap-7 overflow-x-auto border-b border-light">
        {tabs.map((t, i) => {
          const selected = t.id === current.id
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el
              }}
              id={`${base}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => move(e, i)}
              className={`-mb-px shrink-0 border-b-2 py-3 text-sm whitespace-nowrap ${
                selected
                  ? 'border-primary font-bold text-primary'
                  : 'border-transparent font-semibold text-muted hover:text-dark'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        id={`${base}-panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${current.id}`}
      >
        {current.content}
      </div>
    </div>
  )
}
