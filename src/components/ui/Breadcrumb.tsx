import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export type Crumb = { label: string; to?: string }

/** Inicio › Computación › **Notebooks**: el último elemento es la página actual. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Migas de pan" className="px-6 pt-4 text-[13px] text-muted">
      <ol className="m-0 flex list-none flex-wrap items-center p-0">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <Fragment key={`${c.label}-${i}`}>
              <li>
                {last || !c.to ? (
                  <span
                    aria-current={last ? 'page' : undefined}
                    className={last ? 'font-semibold text-text' : ''}
                  >
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.to}>{c.label}</Link>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="mx-1">
                  ›
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
