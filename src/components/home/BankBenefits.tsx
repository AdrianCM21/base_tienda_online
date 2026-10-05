import { getBanks } from '@/services/catalogService'
import { BankCard } from './BankCard'

export function BankBenefits() {
  return (
    <section className="bg-light px-6 py-12">
      <h2 className="mb-1.5 text-[26px] font-bold">Beneficios con tu banco o cooperativa</h2>
      <p className="mb-[26px] text-[14.5px] text-muted">
        Descuentos y cuotas especiales todos los meses.
      </p>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px] p-0">
        {getBanks().map((b) => (
          <BankCard key={b.id} bank={b} />
        ))}
      </ul>
    </section>
  )
}
