/** Definición de las hojas y columnas del archivo de importación (fuente de verdad del formato). */
export type ColumnDef = {
  key: string
  required: boolean
  description: string
  example: string
}

export const SHEET_NAMES = {
  products: 'Productos',
  variants: 'Variantes',
  specs: 'Especificaciones',
  help: 'Instrucciones',
} as const

const col = (key: string, required: boolean, description: string, example: string): ColumnDef => ({
  key,
  required,
  description,
  example,
})

export const PRODUCT_COLUMNS: ColumnDef[] = [
  col('sku', true, 'Código único del producto. Es la clave que une las otras hojas.', 'TD-5001'),
  col(
    'nombre',
    true,
    'Nombre del producto (5 a 120 caracteres).',
    'Notebook Acme Air 14" Ryzen 5 16GB 512GB SSD',
  ),
  col('marca', true, 'Marca.', 'Acme'),
  col('categoria', true, 'Nombre de una categoría existente (ver lista abajo).', 'Computación'),
  col('subcategoria', true, 'Subcategoría que pertenezca a esa categoría.', 'Notebooks'),
  col('precio', true, 'Precio en Gs: número entero mayor a 0.', '5490000'),
  col(
    'stock',
    true,
    'Unidades disponibles (entero ≥ 0). Si el producto tiene variantes se usa la suma de sus stocks.',
    '12',
  ),
  col(
    'descripcion_corta',
    true,
    'Resumen para tarjetas y buscador (máx. 160 caracteres).',
    'Liviana, con pantalla Full HD y batería de todo el día.',
  ),
  col(
    'descripcion',
    true,
    'Descripción larga (pestaña Descripción).',
    'La Acme Air 14 combina un procesador Ryzen 5 con 16 GB de RAM para trabajar y estudiar sin demoras.',
  ),
  col(
    'imagen_principal',
    true,
    'URL o nombre de archivo de la foto principal. Escribí "placeholder" si todavía no hay foto.',
    'placeholder',
  ),
  col(
    'precio_anterior',
    false,
    'Precio antes de la oferta; debe ser mayor a "precio". Activa el badge OFERTA.',
    '5990000',
  ),
  col('cuotas', false, 'Cantidad de cuotas sin interés (1 a 18).', '12'),
  col(
    'imagenes_extra',
    false,
    'Otras fotos separadas por | (barra vertical).',
    'frente.jpg|lateral.jpg',
  ),
  col('destacado', false, '"si" o "no". Los destacados aparecen en la Home.', 'si'),
  col('nuevo', false, '"si" o "no". Muestra la etiqueta Nuevo.', 'no'),
  col('envio_gratis', false, '"si" o "no".', 'si'),
  col('garantia', false, 'Texto libre.', '12 meses'),
  col('calificacion', false, 'Promedio de 0 a 5.', '4.6'),
  col('cantidad_opiniones', false, 'Cantidad de opiniones (entero ≥ 0).', '128'),
  col(
    'puntos_destacados',
    false,
    'Hasta 5 viñetas separadas por |.',
    'Pantalla Full HD|Batería de 10 horas|Windows 11',
  ),
  col(
    'etiquetas',
    false,
    'Palabras clave separadas por coma; mejoran la búsqueda.',
    'liviana, estudiante, oficina',
  ),
  col(
    'fecha_ingreso',
    false,
    'Fecha de alta (AAAA-MM-DD). Se usa para ordenar por "Más nuevos".',
    '2026-09-30',
  ),
  col(
    'slug',
    false,
    'Parte de la URL. Si se deja vacío se genera desde el nombre.',
    'notebook-acme-air-14',
  ),
  col('estado', false, '"activo" (por defecto) o "borrador".', 'activo'),
]

export const VARIANT_COLUMNS: ColumnDef[] = [
  col('sku', true, 'SKU del producto (debe existir en la hoja Productos).', 'TD-5001'),
  col('color_nombre', true, 'Nombre del color.', 'Gris Grafito'),
  col('color_hex', true, 'Color en formato #RRGGBB.', '#4B5563'),
  col('stock', true, 'Unidades de este color (entero ≥ 0).', '8'),
  col('sku_variante', false, 'Código propio del color (único).', 'TD-5001-GRI'),
  col(
    'ajuste_precio',
    false,
    'Diferencia de precio en Gs respecto al producto (puede ser negativa).',
    '0',
  ),
  col('imagenes', false, 'Fotos de este color separadas por |.', 'gris-1.jpg|gris-2.jpg'),
]

export const SPEC_COLUMNS: ColumnDef[] = [
  col('sku', true, 'SKU del producto (debe existir en la hoja Productos).', 'TD-5001'),
  col('grupo', false, 'Grupo de la especificación.', 'Rendimiento'),
  col('atributo', true, 'Nombre de la especificación.', 'Memoria RAM'),
  col('valor', true, 'Valor.', '16 GB'),
  col('filtrable', false, '"si" para ofrecerla como filtro en el listado de la categoría.', 'si'),
]

export const columnKeys = (cols: ColumnDef[]): string[] => cols.map((c) => c.key)
export const requiredKeys = (cols: ColumnDef[]): string[] =>
  cols.filter((c) => c.required).map((c) => c.key)
