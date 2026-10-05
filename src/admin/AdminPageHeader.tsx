import type { ReactNode } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type Props = { title: string; description?: string; actions?: ReactNode }

export function AdminPageHeader({ title, description, actions }: Props) {
  useDocumentTitle(`${title} · Admin`)
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="m-0 text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 mb-0 text-[13.5px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}
