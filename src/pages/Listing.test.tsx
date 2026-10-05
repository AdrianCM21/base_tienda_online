import { screen, within } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { renderWithProviders } from '@/test/renderWithProviders'
import Category from './Category'
import Search from './Search'

function Url() {
  const l = useLocation()
  return <output data-testid="url">{l.pathname + l.search}</output>
}

const app = (
  <>
    <Routes>
      <Route path="categoria/:slug/:sub?" element={<Category />} />
      <Route path="buscar" element={<Search />} />
    </Routes>
    <Url />
  </>
)
const url = () => screen.getByTestId('url').textContent
const results = () => screen.getByText(/Mostrando|0 resultados/).textContent

describe('Listado de categoría', () => {
  it('muestra título, breadcrumb, 9 tarjetas y total real de Notebooks', () => {
    renderWithProviders(app, '/categoria/notebooks')
    expect(screen.getByRole('heading', { level: 1, name: 'Notebooks' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toHaveTextContent(
      'Inicio›Computación›Notebooks',
    )
    expect(screen.getAllByRole('article')).toHaveLength(9)
    expect(results()).toMatch(/^Mostrando 1-9 de 19 resultados$/)
    expect(screen.getByText('19 productos')).toBeInTheDocument()
    expect(document.title).toBe('Notebooks · Tienda Demo')
  })

  it('aplica filtros (marca + RAM) y los refleja en la URL y en el chip', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, '/categoria/notebooks')
    const aside = screen.getByRole('complementary', { name: 'Filtros' })
    await user.click(within(aside).getByRole('checkbox', { name: /^Lenovo/ }))
    await user.click(within(aside).getByRole('checkbox', { name: /^16 GB/ }))
    expect(url()).toBe('/categoria/notebooks') // todavía no se aplicó
    await user.click(within(aside).getByRole('button', { name: 'Aplicar filtros' }))
    expect(url()).toBe('/categoria/notebooks?marca=Lenovo&f.Memoria+RAM=16+GB')
    expect(screen.getByRole('button', { name: 'Quitar filtro Lenovo' })).toBeInTheDocument()
    for (const card of screen.getAllByRole('article'))
      expect(within(card).getByText('Lenovo')).toBeInTheDocument()
  })

  it('el slider de precio y los inputs se sincronizan y filtran', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, '/categoria/notebooks')
    const aside = screen.getByRole('complementary', { name: 'Filtros' })
    fireEvent.change(within(aside).getByRole('slider', { name: 'Precio máximo' }), {
      target: { value: '5000000' },
    })
    expect(within(aside).getByRole('textbox', { name: 'Precio hasta' })).toHaveValue('5.000.000')
    await user.click(within(aside).getByRole('button', { name: 'Aplicar filtros' }))
    expect(url()).toBe('/categoria/notebooks?precio=-5000000')
    for (const card of screen.getAllByRole('article')) {
      const n = Number(
        within(card)
          .getByText(/^Gs\. [\d.]+$/, { selector: 'span.font-bold' })
          .textContent!.replace(/\D/g, ''),
      )
      expect(n).toBeLessThanOrEqual(5000000)
    }
  })

  it('restaura el estado desde la URL', () => {
    renderWithProviders(app, '/categoria/notebooks?marca=HP&orden=menor-precio')
    expect(
      within(screen.getByRole('complementary', { name: 'Filtros' })).getByRole('checkbox', {
        name: /^HP/,
      }),
    ).toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Ordenar por:' })).toHaveValue('menor-precio')
    const prices = screen
      .getAllByRole('article')
      .map((a) => within(a).getByText(/^Gs\. [\d.]+$/, { selector: 'span.font-bold' }).textContent!)
    const nums = prices.map((t) => Number(t.replace(/\D/g, '')))
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })

  it('ordenar reinicia la página y pagina con la URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, '/categoria/notebooks')
    await user.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(url()).toBe('/categoria/notebooks?pagina=2')
    expect(results()).toMatch(/^Mostrando 10-18 de 19/)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Ordenar por:' }), 'mayor-precio')
    expect(url()).toBe('/categoria/notebooks?orden=mayor-precio')
  })

  it('quitar un chip y "Limpiar" actualizan la URL', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, '/categoria/notebooks?marca=HP&marca=Dell')
    await user.click(screen.getByRole('button', { name: 'Quitar filtro HP' }))
    expect(url()).toBe('/categoria/notebooks?marca=Dell')
    await user.click(
      within(screen.getByRole('complementary', { name: 'Filtros' })).getByRole('button', {
        name: 'Limpiar',
      }),
    )
    expect(url()).toBe('/categoria/notebooks')
  })

  it('sin resultados muestra el estado vacío y permite salir', async () => {
    const user = userEvent.setup()
    renderWithProviders(app, '/categoria/notebooks?marca=Lenovo&precio=1-2')
    expect(results()).toBe('0 resultados')
    expect(screen.getByText('No encontramos productos')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Quitar filtros y búsqueda' }))
    expect(url()).toBe('/categoria/notebooks')
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
  })

  it('una categoría de nivel superior lista sus subcategorías y la resalta', () => {
    renderWithProviders(app, '/categoria/informatica')
    expect(screen.getByRole('link', { name: 'Monitores' })).toHaveAttribute(
      'href',
      '/categoria/informatica/monitores',
    )
    expect(
      screen
        .getAllByRole('link', { name: 'Computación' })
        .some((l) => l.getAttribute('aria-current') === 'page'),
    ).toBe(true)
  })

  it('slug inexistente muestra 404', () => {
    renderWithProviders(app, '/categoria/nada')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })
})

describe('Búsqueda', () => {
  it('filtra por texto y titula con la consulta', () => {
    renderWithProviders(app, '/buscar?q=lenovo')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Resultados para “lenovo”')
    for (const card of screen.getAllByRole('article')) expect(card).toHaveTextContent(/lenovo/i)
  })
  it('?ofertas=1 muestra solo ofertas', () => {
    renderWithProviders(app, '/buscar?ofertas=1')
    expect(screen.getByRole('heading', { level: 1, name: 'Ofertas' })).toBeInTheDocument()
    for (const card of screen.getAllByRole('article'))
      expect(within(card).getByText('OFERTA')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Solo productos en oferta/ })).toBeChecked()
  })
  it('sin resultados sugiere revisar la búsqueda', () => {
    renderWithProviders(app, '/buscar?q=zzzzqq')
    expect(screen.getByText(/Revisá la ortografía/)).toBeInTheDocument()
  })
})
