export type Subcategory = {
  id: string
  slug: string
  name: string
  /** Claves de `Product.specs` que se ofrecen como filtro en este listado. */
  filterSpecs?: string[]
}

export type SubcategoryGroup = {
  title: string
  items: Subcategory[]
}

export type Category = {
  id: string
  slug: string
  name: string
  /** Nombre de icono de lucide-react (PascalCase). */
  icon: string
  groups: SubcategoryGroup[]
}
