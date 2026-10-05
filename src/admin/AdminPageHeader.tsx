import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type Props = {
  title: string
  description?: string
  actions?: ReactNode
  back?: { label: string; to: string }
}

export function AdminPageHeader({ title, description, actions, back }: Props) {
  useDocumentTitle(`${title} · Admin`)
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        {back && (
          <Link
            to={back.to}
            className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="m-0 text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 mb-0 text-[13.5px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}
