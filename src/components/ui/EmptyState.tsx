import type { ReactNode } from 'react'

type Props = { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }

export function EmptyState({ icon, title, children, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-card border border-light bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light text-primary">
        {icon}
      </div>
      <h2 className="m-0 mb-1.5 text-lg font-bold">{title}</h2>
      {children && <p className="m-0 mb-5 max-w-[420px] text-[14px] text-muted">{children}</p>}
      {action}
    </div>
  )
}
