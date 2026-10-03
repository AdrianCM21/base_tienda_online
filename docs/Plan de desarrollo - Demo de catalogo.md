# Plan de desarrollo — Demo de catálogo de productos

> Estado: **planeación** (no se escribió código). Fuentes: `docs/Prompt Claude Code - React.md` y los 4 mockups en `docs/base/`.
> Donde este plan contradice al prompt original, **manda este plan** (el prompt es de la tienda "Voltia" y este proyecto es una demo genérica). Los mockups siguen mandando en lo **visual**.

---

## 1. Objetivo y alcance

Una aplicación web **demo de catálogo de productos**, totalmente navegable y con comportamiento real del lado del cliente, pensada para mostrársela a clientes potenciales.

| Incluye | No incluye |
|---|---|
| Home, categorías, búsqueda, detalle de producto | Backend, base de datos, autenticación real |
| Filtros, orden y paginación reales (sobre JSON local) | Pagos reales |
| **Variantes de color** por producto | Persistencia compartida entre usuarios |
| Carrito y checkout **simulados** | Panel admin con funciones reales |
| Selector de moneda Gs / USD | |
| Panel administrador **demo** (solo visual) con **importador XLSX** | |
| Marca y paleta **configurables** (sin "Voltia") | |

## 2. Decisiones ya tomadas

1. Carrito y checkout: simulación (no se cobra nada; termina en una pantalla de "Pedido confirmado").
2. Datos: JSON local en el repo.
3. Imágenes: placeholders por ahora (ver §7 para dejar el cambio a fotos reales en un solo paso).
4. Sin nombre "Voltia": toda la identidad sale de un único archivo de configuración.
5. Colores: variantes de color por producto (y, como extra de demo, paleta de la tienda intercambiable; ver §6).
6. Panel admin: solo para ver, sin acciones reales, **excepto** que el importador XLSX valida y previsualiza el archivo de verdad.

## 3. Stack

- **React 19 + Vite 8 + TypeScript + React Router + Tailwind CSS v4**, iconos `lucide-react`. Lint con **oxlint** (viene con la plantilla de Vite) y formato con Prettier.
- Fuentes: Space Grotesk (títulos) y Public Sans (texto), **autoalojadas** (se pueden extraer de los woff2 incluidos en los mockups) para que la demo no dependa de Google Fonts.
- **SheetJS (`xlsx`)** para leer y generar archivos Excel en el navegador.
- **Vitest + Testing Library** para lógica; **Playwright** para humo de las rutas principales.
- Despliegue: Vercel o Netlify (con rewrite a `index.html` para el router).

### Identidad y tema (clave para "desligarse de Voltia")

- `src/config/brand.ts`: `name`, `legalName`, `tagline`, `logoText`, `contact`, `currency` (tasa Gs/USD), `whatsapp`, textos del footer. **Ningún otro archivo escribe el nombre de la marca.**
- Nombre provisorio: **"Tienda Demo"** (se cambia en una línea).
- Los colores del prompt pasan a **variables CSS** (`--color-primary`, `--color-dark`, etc.) y Tailwind las consume (`bg-primary`). Eso permite cambiar paleta sin tocar componentes. La paleta azul actual queda como tema por defecto, `azul`.

## 4. Estructura de carpetas

```
src/
  config/        brand.ts, themes.ts, site.ts
  data/          products.json, categories.json, banks.json, orders.demo.json
  types/         product.ts, cart.ts, admin.ts
  services/      catalogService.ts   (getProducts, getProduct, getRelated, search…)
  utils/         format.ts (precios/moneda), filters.ts, sort.ts, slug.ts, storage.ts, xlsx/
  context/       CartContext, CurrencyContext, ThemeContext
  hooks/         useCatalogQuery (filtros ↔ URL), useMediaQuery, useDebounce
  components/    layout/, catalog/, product/, cart/, checkout/, ui/
  pages/         Home, Category, Search, Product, Cart, Checkout, OrderDone, NotFound
  admin/         AdminLayout, Dashboard, Products, ImportXlsx, Orders, Categories, Appearance, Settings
scripts/         generate-products.ts, build-xlsx-template.ts
public/          placeholders/, fonts/
```

Regla del proyecto: todo código genérico (formateo de precio, validadores, slug, storage) vive en `utils/`, nunca dentro de una página o feature.

## 5. Modelo de datos

```ts
type Product = {
  id: string; sku: string; slug: string;
  name: string; brand: string;
  categoryId: string; subcategoryId: string;
  price: number;              // siempre en Gs, entero
  oldPrice?: number;          // si existe → badge OFERTA + "Ahorrás"
  installments?: { count: number; interestFree: boolean };
  stock: number;
  shortDescription: string; description: string;
  images: string[];           // la primera es la principal
  colors: ColorVariant[];     // puede ser []
  specs: Record<string, string>;      // alimenta filtros y la pestaña Especificaciones
  highlights?: string[];      // 3–5 viñetas
  tags?: ("nuevo"|"destacado"|"oferta"|"envio-gratis")[];
  rating?: number; reviewCount?: number;
  warranty?: string; createdAt: string;
};
type ColorVariant = {
  name: string; hex: string; sku?: string;
  stock: number; priceDelta?: number; images?: string[];
};
```

Datos mock:
- **~60 productos** coherentes: Notebooks (~24, con los 9 del prompt incluidos), Electrónica (~12), Electrodomésticos (~12), el resto repartido en pocas unidades en las demás categorías para que toda la navegación lleve a algo.
- Se generan con `scripts/generate-products.ts` (semilla fija) y se guardan en `products.json`; así se pueden regenerar y ajustar.
- Los **contadores de los filtros se calculan** desde los datos (no hardcodeados). El "128 productos" del mockup pasa a ser el conteo real.
- Al menos **20 productos con variantes de color**, y casos límite: sin stock, un solo color, sin oferta, nombre largo.
- Las 10 categorías con subcategorías del prompt van en `categories.json`.

## 6. Variantes de color (feature central)

- **Detalle de producto:** selector de swatches circulares (nombre del color al lado), color elegido con anillo de foco. Al cambiar de color: cambia la galería (si la variante tiene imágenes), el SKU, el stock y el precio si hay `priceDelta`. Color sin stock → swatch tachado y deshabilitado.
- **Tarjeta de producto:** fila de hasta 4 swatches pequeños + "+N"; el hover o click en un swatch cambia la imagen de la tarjeta.
- **Filtro "Color"** en el sidebar de categoría (checkbox con swatch + contador).
- **Carrito/checkout:** cada línea es `producto + color`; se muestra el color elegido.
- **Placeholders con color:** el placeholder se tinta con el `hex` de la variante, así el cambio de color se ve aunque no haya fotos.
- **Extra (paleta de la tienda):** `ThemeContext` con 4–5 temas predefinidos (azul, verde, rojo, violeta, grafito), selector discreto para la demo y también en `admin → Apariencia`. Se guarda en `localStorage`. Es barato porque ya usamos variables CSS.

## 7. Imágenes y placeholders

- Componente único `<ProductImage />`: si la URL falta o falla, dibuja un placeholder SVG (fondo `light`, icono de categoría, tinte del color de la variante).
- Todas las imágenes se resuelven por un único helper (`utils/image.ts`). Para pasar a fotos reales basta con soltar archivos en `public/products/` o poner URLs en el JSON/XLSX: **cero cambios de código**.
- El hero usa la imagen webp que viene en el mockup Home (se extrae del bundle).

## 8. Panel administrador DEMO (`/admin`)

Visualmente completo y creíble, pero **sin funciones reales**. Aviso fijo "Modo demo — los cambios no se guardan". `noindex`. Acceso: pantalla de login falsa con botón "Entrar como demo" (sin credenciales reales).

| Sección | Contenido (todo estático, salvo lo indicado) |
|---|---|
| Dashboard | KPIs (ventas, pedidos, ticket promedio, productos activos), gráfico de ventas, top productos, alertas de stock bajo. Datos calculados desde `products.json` + números ficticios. |
| Productos | Tabla con búsqueda, filtros, estado (activo/sin stock/oferta), miniatura, colores. Botones Editar/Eliminar/Nuevo abren un modal o muestran un aviso "No disponible en la demo". |
| **Importar XLSX** | **Parcialmente real** (ver §9). |
| Pedidos | Lista ficticia + los pedidos creados en el checkout simulado (guardados en `localStorage`) aparecen aquí: cierra el circuito de la demo. |
| Categorías | Árbol de categorías, solo lectura. |
| Apariencia | Selector de tema/paleta y nombre de la marca con vista previa (usa `ThemeContext`). |
| Configuración | Formularios ficticios (datos de la tienda, envío, medios de pago). |

## 9. Importador XLSX (detalle)

**Comportamiento:** arrastrar/seleccionar `.xlsx` → se lee en el navegador → validación fila por fila → vista previa con errores y advertencias → botón "Importar" que **simula** el resultado ("48 productos importados") sin modificar el catálogo. Incluye **botón "Descargar plantilla"** (generada con SheetJS, con una hoja de instrucciones y filas de ejemplo) y "Descargar errores".

> Opción a decidir: que el "Importar" sí agregue los productos al catálogo del navegador (`localStorage`) para demostrar el flujo completo. Recomiendo dejarlo **desactivado por defecto** y activable con una constante, para mantener la demo predecible.

El archivo tiene 4 hojas:

### Hoja `Productos` (una fila por producto)

| Columna | Obligatorio | Formato / regla |
|---|---|---|
| `sku` | **Sí** | Texto único. Es la clave de unión con las otras hojas. |
| `nombre` | **Sí** | Texto, 5–120 caracteres. |
| `marca` | **Sí** | Texto. |
| `categoria` | **Sí** | Debe coincidir con una categoría existente. |
| `subcategoria` | **Sí** | Debe pertenecer a esa categoría. |
| `precio` | **Sí** | Entero > 0, en Gs. |
| `stock` | **Sí** | Entero ≥ 0 (si hay hoja de variantes, se ignora y se suma el de las variantes). |
| `descripcion_corta` | **Sí** | Máx. 160 caracteres (tarjetas y buscador). |
| `descripcion` | **Sí** | Texto largo (pestaña Descripción). |
| `imagen_principal` | **Sí** | URL o nombre de archivo; `placeholder` es válido. |
| `precio_anterior` | No | Debe ser > `precio`; activa badge OFERTA. |
| `cuotas` | No | Entero 1–18 (sin interés). |
| `imagenes_extra` | No | Lista separada por `|`. |
| `destacado` | No | `si` / `no` (aparece en Home). |
| `nuevo` | No | `si` / `no` (badge "Nuevo"). |
| `envio_gratis` | No | `si` / `no`. |
| `garantia` | No | Ej. `12 meses`. |
| `calificacion` | No | 0–5, un decimal. |
| `cantidad_opiniones` | No | Entero ≥ 0. |
| `puntos_destacados` | No | Hasta 5 viñetas separadas por `|`. |
| `etiquetas` | No | Separadas por `,` (mejoran la búsqueda). |
| `fecha_ingreso` | No | `AAAA-MM-DD` (ordenar por "Más nuevos"). |
| `slug` | No | Se genera desde el nombre si falta. |
| `estado` | No | `activo` (por defecto) / `borrador`. |

### Hoja `Variantes` (colores; una fila por color, opcional)

| Columna | Obligatorio | Regla |
|---|---|---|
| `sku` | **Sí** | Debe existir en `Productos`. |
| `color_nombre` | **Sí** | Ej. `Negro Medianoche`. |
| `color_hex` | **Sí** | `#RRGGBB`. |
| `stock` | **Sí** | Entero ≥ 0. |
| `sku_variante` | No | Único. |
| `ajuste_precio` | No | Entero (puede ser negativo). |
| `imagenes` | No | Lista separada por `|`. |

### Hoja `Especificaciones` (formato largo, opcional)

| Columna | Obligatorio |
|---|---|
| `sku` | **Sí** |
| `grupo` | No (ej. `Rendimiento`) |
| `atributo` | **Sí** (ej. `Memoria RAM`) |
| `valor` | **Sí** (ej. `8 GB`) |
| `filtrable` | No (`si` hace que aparezca como filtro en la categoría) |

### Hoja `Instrucciones`
Descripción de columnas, ejemplos y lista de categorías/subcategorías válidas.

### Campos añadidos para que la demo luzca mejor
`precio_anterior`, `cuotas`, `colores`, `destacado`, `nuevo`, `envio_gratis`, `garantia`, `calificacion`, `cantidad_opiniones`, `puntos_destacados`, `etiquetas`, `fecha_ingreso`, especificaciones filtrables. Son opcionales pero dan badges, ofertas, ordenamiento, ratings y filtros dinámicos.

### Validaciones
`sku` duplicado, categoría inexistente, `precio_anterior ≤ precio`, hex inválido, URL mal formada, `sku` huérfano en otras hojas, columnas obligatorias ausentes. Cada error indica **hoja, fila, columna y motivo**. Las advertencias (ej. falta `descripcion` larga recomendada) no bloquean.

## 10. Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Home |
| `/categoria/:slug` (+ `/:sub`) | Listado con filtros |
| `/buscar?q=` | Resultados de búsqueda |
| `/producto/:slug` | Detalle (`?color=` preselecciona variante) |
| `/carrito` | Carrito completo (además del mini-carrito en drawer) |
| `/checkout` y `/pedido/:id` | Checkout 2 pasos y confirmación |
| `/admin/*` | Panel demo |
| `*` | 404 |

Filtros, orden y página viven en la **URL** (`?marca=lenovo&precio=…&orden=menor-precio&pagina=2`): se pueden compartir y funciona el botón Atrás.

---

## 11. Fases

Cada fase termina en algo ejecutable y verificable. Estimaciones orientativas para una persona trabajando con Claude Code.

### Fase 0 — Preparación (0,5 día) ✅ completa
- Mover los 4 HTML de `docs/base/` a `/reference` y extraer de ellos: imagen del hero, fuentes woff2, y el markup/CSS de cada pantalla como referencia visual.
- Inicializar el repo con git **local** (sin remoto).
- Definir nombre provisorio y confirmar la paleta.
- **Entregable:** `reference/` ordenado y `assets/` extraídos.

### Fase 1 — Cimientos (1 día) ✅ completa
- Vite + React + TS + Tailwind + Router + ESLint/Prettier + Vitest.
- Tokens como variables CSS, fuentes autoalojadas, `brand.ts`, `themes.ts`.
- Estructura de carpetas, `AppLayout`, rutas vacías, foco visible global.
- **Hecho cuando:** `npm run dev` muestra el layout vacío y cambiar `brand.name` cambia el nombre en toda la app.

### Fase 2 — Datos y servicios (1–1,5 días) ✅ completa
- Tipos, `categories.json`, script generador, `products.json` (~60 con variantes).
- `catalogService` (listar, filtrar, ordenar, paginar, buscar, relacionados) + `utils/` (formato de precio/moneda, slug, filtros, sort, storage).
- Tests unitarios de formato, filtros, orden y búsqueda.
- **Hecho cuando:** los tests pasan y los conteos de filtros salen de los datos.

### Fase 3 — Componentes compartidos (1,5 días) ✅ completa
- TopBar, Header (buscador con sugerencias, cuenta, carrito), Footer, `CategorySidebar` (acordeón), `ProductCard` (con swatches), `ProductImage`, `Badge`, `Button`, `Pagination`, `Breadcrumb`, `Toast`.
- `CurrencyContext` y `CartContext` (persistidos en `localStorage`, línea = producto + color).
- **Hecho cuando:** los componentes se ven iguales a los mockups en una página de prueba (Storybook opcional).

### Fase 4 — Home (1 día) ✅ completa
- Hero, Beneficios con banco, Destacados (desde `destacado`), franja de envío, newsletter (simulado, con confirmación).
- **Hecho cuando:** `/` coincide con el mockup y los destacados salen del JSON.

### Fase 5 — Categoría y búsqueda (2 días) ✅ completa
- Sidebar de filtros (marca, precio con doble slider, color, filtros por especificación), orden, paginación, estado en URL, estados vacíos.
- Drawer de filtros en móvil, chips de filtros activos, botón "Limpiar".
- Página `/buscar`.
- **Hecho cuando:** todos los filtros combinados dan resultados correctos, el contador "Mostrando X–Y de N" es real y la URL reproduce el estado.

### Fase 6 — Detalle de producto (1,5–2 días) ✅ completa
- Galería con miniaturas, selector de color y cantidad, caja de precio/ahorro/cuotas, stock por variante, specs, tabs funcionales, relacionados, "Comprar ahora".
- Opiniones: lista ficticia determinista por producto.
- **Hecho cuando:** cambiar de color actualiza galería, SKU, stock y precio; producto inexistente muestra 404.

### Fase 7 — Carrito y checkout simulados (2 días) ✅ completa
- Mini-carrito (drawer) + `/carrito`: cantidades, quitar, subtotal, envío gratis sobre Gs. 500.000.
- Checkout en 2 pasos con validación (teléfono, tarjeta con Luhn de prueba, vencimiento), opciones tarjeta/transferencia/efectivo, resumen dinámico.
- "Confirmar pedido" → pantalla `/pedido/:id` con número de pedido, resumen y aviso "Esto es una demostración, no se realizó ningún cobro". El pedido se guarda en `localStorage`.
- **Hecho cuando:** se puede ir de la tarjeta a la confirmación con el carrito real y el carrito se vacía al final.

### Fase 8 — Panel admin demo + importador XLSX (3 días)
- Layout, login falso, Dashboard, Productos, Pedidos, Categorías, Apariencia, Configuración.
- Módulo `utils/xlsx/`: `parseWorkbook`, `validateRows`, `buildTemplate`, `buildErrorReport`; UI de carga con arrastrar-soltar, vista previa por pestañas y resumen de errores.
- Tests del validador con archivos de ejemplo válidos e inválidos (`tests/fixtures/`).
- **Hecho cuando:** la plantilla descargada se vuelve a subir y valida sin errores, y un archivo roto muestra cada error con hoja/fila/columna.

### Fase 9 — Pulido (1,5–2 días)
- Responsive en 360 / 768 / 1280 px, a11y (teclado, `aria-*`, contraste en todos los temas), skeletons de carga, `<title>` y meta por ruta, 404, favicon genérico, selector de tema, rendimiento (lazy routes, imágenes diferidas).
- Revisión visual lado a lado contra `/reference`.
- **Hecho cuando:** Lighthouse ≥ 90 en performance y accesibilidad en Home y Producto.

### Fase 10 — QA y entrega (1 día)
- Playwright: flujo Home → categoría → filtro → producto → color → carrito → checkout → confirmación; flujo admin → importar plantilla.
- Build de producción, despliegue en Vercel/Netlify, README con cómo cambiar marca, tema, datos e imágenes.
- **Hecho cuando:** URL pública funcionando y checklist de §13 completo.

**Total estimado: ~16–19 días de trabajo** (menos si se recortan Opiniones, temas o el dashboard con gráficos).

## 12. Orden recomendado si hay que recortar

Imprescindible: Fases 0–7. Después, por impacto en demo: importador XLSX (parte de la 8), selector de color en tarjetas, resto del admin, temas de la tienda, Playwright.

## 13. Checklist final de la demo

- [ ] No aparece la palabra "Voltia" en ningún archivo (`grep -ri voltia`).
- [ ] La marca se cambia en un solo archivo.
- [ ] Filtros, orden, paginación y búsqueda funcionan combinados.
- [ ] Variantes de color en tarjeta, detalle, filtro y carrito.
- [ ] Gs ↔ USD en todas las pantallas, incluido el carrito.
- [ ] Carrito persiste al recargar.
- [ ] Checkout simulado con aviso claro de demostración.
- [ ] Admin con aviso "Modo demo" y `noindex`.
- [ ] Plantilla XLSX descargable, validación con errores precisos.
- [ ] Sin errores en consola; build de producción limpio.

## 14. Riesgos

| Riesgo | Mitigación |
|---|---|
| Placeholders restan atractivo en la demo | Tinte por color + fácil reemplazo (§7); decidir fuente de fotos antes de la Fase 9. |
| El XLSX crece en complejidad | Limitar a 4 hojas definidas aquí; validador aislado y con tests. |
| Deriva visual respecto a los mockups | Comparar cada pantalla con `/reference` al cerrar cada fase. |
| Tamaño del bundle por SheetJS | Cargarlo con `import()` dinámico solo en `/admin/importar`. |
| Confusión de la gente con una tienda real | Avisos de "demostración" en checkout y admin. |

## 15. Decisiones confirmadas

1. **Marca:** "Tienda Demo" (provisorio, se cambia en `brand.ts`).
2. **Colores:** ambas cosas: variantes de color por producto **y** paletas intercambiables de la tienda.
3. **Importador XLSX:** valida, previsualiza y **simula** la importación; no modifica el catálogo (constante para activarlo más adelante).
4. **Idioma y moneda:** español, Gs / USD.
5. **Imágenes:** placeholders por ahora; la fuente de fotos reales queda para antes de la Fase 9.
