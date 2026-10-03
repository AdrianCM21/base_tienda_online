import type { ReactNode } from 'react'

const tones = {
  sale: 'bg-primary text-white',
  muted: 'bg-light text-dark',
  dark: 'bg-dark text-white',
} as const

type Props = { tone?: keyof typeof tones; className?: string; children: ReactNode }

export function Badge({ tone = 'sale', className = '', children }: Props) {
  return (
    <span
      className={`inline-block rounded-[4px] px-2 py-[3px] text-[11px] font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
