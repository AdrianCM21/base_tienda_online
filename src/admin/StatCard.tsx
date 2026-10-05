import type { ReactNode } from 'react'

type Props = { label: string; value: string; hint?: string; icon: ReactNode; delta?: ReactNode }

export function StatCard({ label, value, hint, icon, delta }: Props) {
  return (
    <div className="rounded-card border border-light bg-white p-[18px]">
      <div className="mb-2.5 flex items-center justify-between text-[12.5px] font-semibold text-muted">
        {label}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light text-primary">
          {icon}
        </span>
      </div>
      <div className="text-2xl leading-tight font-bold whitespace-nowrap">{value}</div>
      {delta && <div className="mt-1.5">{delta}</div>}
      {hint && <div className="mt-1 text-xs text-subtle">{hint}</div>}
    </div>
  )
}
