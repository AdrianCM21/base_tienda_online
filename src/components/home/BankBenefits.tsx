import { getBanks } from '@/services/catalogService'
import { DemoLink } from '../ui/DemoLink'

export function BankBenefits() {
  return (
    <section className="bg-light px-6 py-12">
      <h2 className="mb-1.5 text-[26px] font-bold">Beneficios con tu banco o cooperativa</h2>
      <p className="mb-[26px] text-[14.5px] text-muted">
        Descuentos y cuotas especiales todos los meses.
      </p>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px] p-0">
        {getBanks().map((b) => (
          <li key={b.id} className="rounded-card bg-white p-[22px]">
            <div className="mb-2 font-heading text-base font-bold text-dark">{b.name}</div>
            <div className="mb-1.5 text-[26px] font-bold text-primary">{b.benefit}</div>
            <div className="mb-3.5 text-[13px] text-muted">{b.condition}</div>
            <DemoLink
              className="text-[13px] font-semibold text-primary hover:text-dark"
              message="El detalle del beneficio no está disponible en la demo"
            >
              Ver más →
            </DemoLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
