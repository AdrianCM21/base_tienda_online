import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { paths } from '@/config/routes'
import { getCategories } from '@/services/catalogService'
import { DemoLink } from '../ui/DemoLink'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../ui/SocialIcons'

const HELP = ['Preguntas frecuentes', 'Envíos', 'Devoluciones', 'Garantías', 'Contacto']
const COMPANY = ['Sobre nosotros', 'Sucursales', 'Trabajá con nosotros', 'Términos y condiciones']
const FOOTER_CATEGORIES = ['informatica', 'electronica', 'electrodomesticos', 'moda', 'muebles']

const title = 'mb-3.5 font-sans text-sm font-bold text-white'
const link = 'block py-1 text-[13.5px] text-on-dark hover:text-white'

export function Footer() {
  const categories = getCategories().filter((c) => FOOTER_CATEGORIES.includes(c.slug))
  return (
    <footer className="bg-dark px-6 pt-12">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-7 pb-9 md:grid-cols-4">
        <nav aria-label="Categorías del pie de página">
          <h2 className={title}>Categorías</h2>
          {categories.map((c) => (
            <Link key={c.slug} to={paths.category(c.slug)} className={link}>
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Ayuda">
          <h2 className={title}>Ayuda</h2>
          {HELP.map((t) => (
            <DemoLink key={t} className={`${link} w-full`}>
              {t}
            </DemoLink>
          ))}
        </nav>
        <nav aria-label="Empresa">
          <h2 className={title}>Empresa</h2>
          {COMPANY.map((t) => (
            <DemoLink key={t} className={`${link} w-full`}>
              {t}
            </DemoLink>
          ))}
        </nav>
        <div>
          <h2 className={title}>Síguenos</h2>
          <div className="flex gap-3 text-on-dark">
            {[
              ['Facebook', FacebookIcon],
              ['Instagram', InstagramIcon],
              ['YouTube', YoutubeIcon],
            ].map(([name, Icon]) => {
              const I = Icon as typeof FacebookIcon
              return (
                <DemoLink
                  key={name as string}
                  message={`${name as string} no está disponible en la demo`}
                  className="text-on-dark hover:text-white"
                >
                  <span className="sr-only">{name as string}</span>
                  <I />
                </DemoLink>
              )
            })}
          </div>
        </div>
      </div>
      <p className="m-0 border-t border-white/[0.12] py-4 text-center text-[12.5px] text-footer-copy">
        © 2026 {brand.name}. Todos los derechos reservados.
      </p>
    </footer>
  )
}
