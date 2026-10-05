const TONES = {
  green: 'bg-emerald-100 text-emerald-800',
  blue: 'bg-sky-100 text-sky-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-neutral-200 text-neutral-700',
} as const

export type Tone = keyof typeof TONES

export function StatusBadge({ tone, children }: { tone: Tone; children: string }) {
  return (
    <span
      className={`inline-block rounded-pill px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}
