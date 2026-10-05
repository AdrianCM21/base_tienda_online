import type { Bank } from '@/types/bank'
import { DemoLink } from '../ui/DemoLink'

/** Tarjeta de un beneficio bancario (Home y vista previa del panel). */
export function BankCard({ bank }: { bank: Pick<Bank, 'name' | 'benefit' | 'condition'> }) {
  return (
    <li className="rounded-card bg-white p-[22px]">
      <div className="mb-2 font-heading text-base font-bold text-dark">{bank.name}</div>
      <div className="mb-1.5 text-[26px] font-bold text-primary">{bank.benefit}</div>
      <div className="mb-3.5 text-[13px] text-muted">{bank.condition}</div>
      <DemoLink
        className="text-[13px] font-semibold text-primary hover:text-dark"
        message="El detalle del beneficio no está disponible en la demo"
      >
        Ver más →
      </DemoLink>
    </li>
  )
}
