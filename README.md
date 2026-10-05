# Tienda Demo — demo de catálogo de productos

Aplicación web de **demostración de un catálogo de productos**: tienda con filtros, variantes de color, carrito y checkout simulados, y un panel administrador de muestra con importador de productos desde Excel. Todo corre en el navegador (sin backend): los datos son JSON local y el carrito, los pedidos y las preferencias se guardan en `localStorage`.

**Stack:** React 19 · Vite 8 · TypeScript · React Router · Tailwind CSS v4 · Vitest · Playwright.

## Puesta en marcha

Requiere Node 22.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build local |
| `npm test` | Tests unitarios y de componentes (Vitest) |
| `npm run e2e` | Tests de punta a punta (Playwright) sobre el build de producción |
| `npm run lint` / `npm run format` | oxlint / Prettier |
| `npm run generate:products` | Regenera `src/data/products.json` |

## Cómo personalizar la demo

### Marca
Todo el nombre y los datos de contacto salen de **`src/config/brand.ts`** (`name`, `logoText`, `tagline`, contacto, tasa Gs/USD, umbral de envío gratis y tarifa de envío). `index.html`, los títulos de cada página y el footer lo toman de ahí. Un test falla si aparece la marca anterior en el código. La imagen del hero se define con `brand.heroImage` (vacío = ilustración por defecto).

### Paletas de color
Las 5 paletas (azul, verde, rojo, violeta, grafito) están en **`src/config/themes.ts`**. Cada una define los 13 colores de la interfaz y un test verifica que cumplan contraste AA. Se cambian en vivo desde la barra de demo o desde **Admin → Apariencia**, y la elección se recuerda en el navegador. Si cambiás los valores del tema por defecto (azul), actualizá también el bloque `@theme` de `src/index.css` (un test lo verifica).

### Productos y categorías
- `src/data/categories.json`: las 10 categorías con sus subcategorías (se edita a mano). `filterSpecs` indica qué especificaciones se ofrecen como filtro en cada subcategoría.
- `src/data/products.json`: 72 productos, con variantes de color. Se genera con `npm run generate:products` a partir de `scripts/generate-products.ts` (semilla fija: siempre el mismo resultado). Podés editar el JSON a mano o el script.
- `src/data/banks.json`, `branches.json`, `departments.json`: beneficios bancarios, sucursales y departamentos.
- Las pantallas leen el catálogo solo a través de `src/services/catalogService.ts`: si más adelante hay una API, solo hay que tocar ese archivo.

### Imágenes
Hoy los productos no traen fotos (`images: []`) y la interfaz dibuja placeholders con el icono de la categoría, teñidos con el color de la variante. Para usar fotos reales:

1. Poné los archivos en `public/products/` (por ejemplo `public/products/td-4021.webp`).
2. En `src/data/products.json` completá `images` con rutas como `"/products/td-4021.webp"`. Cada variante de color puede tener las suyas en `colors[].images`.
3. Sin cambios de código: la galería, las tarjetas, el carrito y el checkout las usan automáticamente.

También se pueden cargar por URL desde el importador XLSX (columnas `imagen_principal`, `imagenes_extra` y `imagenes`).

## Barra de demo

Franja superior para **presentar** la aplicación: salta a Inicio, Categoría, Búsqueda, Producto, Carrito, Checkout, Confirmación y Admin. Carrito, Checkout y Confirmación se preparan solos con datos de ejemplo para que no abran vacíos. Incluye selector de paleta y **Reiniciar demo** (con confirmación), que borra carrito, pedidos, moneda y tema.

- Ocultar: botón ✕ (se recuerda) o `?demo=0` en la URL (solo esa pestaña); `?demo=1` la vuelve a mostrar.
- Quitarla del build: `VITE_DEMO_BAR=false npm run build`.
- Pantallas y datos de ejemplo: `src/config/demoScreens.ts`.

## Panel administrador demo (`/admin`)

Acceso con el botón "Entrar como demo" (no hay cuentas reales). Es una **vitrina**: se puede recorrer y "editar" en pantalla, pero los cambios no se guardan ni tocan la tienda. Lo que sí funciona de verdad: la validación del importador, la exportación de pedidos (CSV) y del catálogo (XLSX), el cambio de paleta y los pedidos que se hacen en el checkout. El panel es `noindex` y muestra siempre el aviso "Modo demo". Pensado para **cualquier rubro** (ferretería, tecnología, moda…).

| Sección | Qué incluye |
|---|---|
| **Inicio** | Período 7/14/30 días, KPIs con variación contra el período anterior, "Por hacer", gráfico, ventas por categoría y medio de pago, más vendidos y stock bajo |
| **Ventas › Clientes** | Clientes derivados de los pedidos, segmentos (nuevo, recurrente, VIP), historial y WhatsApp, exportar CSV |
| **Ventas › Pedidos** | Estados (pendiente, confirmado, preparando, enviado, entregado, cancelado), línea de tiempo, notas, WhatsApp, copiar resumen, filtros y exportar CSV |
| **Catálogo › Productos** | Tabla con orden, filtros y acciones en lote; editor con pestañas (general, precios y ofertas, inventario, variantes por color/talle/medida, imágenes, especificaciones, SEO); importar y exportar |
| **Catálogo › Categorías** | Árbol con cantidad de productos |
| **Catálogo › Inventario** | Stock por producto y variante, valor del inventario, umbral de stock bajo configurable, exportar CSV |
| **Reportes** | Ventas por día, ranking de productos, ventas por categoría y por medio de pago; cada uno exportable a CSV |
| **Marketing** | Cupones (estados, pausar, crear con vista previa), beneficios con bancos (editables, con vista previa de la Home) y banners y destacados |
| **Tienda** | Apariencia (paletas, color propio con aviso de contraste, logo y vista previa) y Configuración en 5 pestañas (general y horarios, envíos, pagos, impuestos, usuarios y roles) |

El **buscador global** (Ctrl+K) encuentra secciones, productos, pedidos y clientes, y la **guía de inicio** de Inicio marca sus pasos al visitar cada pantalla. La campanita de la barra superior avisa de los pedidos hechos en la tienda de la demo y abre su detalle. El plan de evolución del panel está en `docs/Plan admin - panel competitivo.md`.

### Importar y exportar productos (XLSX)

1. En **Productos › Importar** descargá la plantilla (4 hojas: Productos, Variantes, Especificaciones e Instrucciones con todas las columnas y las categorías válidas). Con **Exportar catálogo** obtenés tu catálogo actual en el mismo formato.
2. Completala y subila: se valida fila por fila (hoja, fila, columna y motivo), con vista previa y descarga de los problemas en CSV.
3. Elegí el modo: *crear y actualizar por SKU*, *solo crear nuevos* o *solo precios y stock*. La vista previa muestra qué sería nuevo, qué se actualizaría (y qué campos), qué quedaría sin cambios y qué se omitiría.
4. "Importar" **simula** el resultado: el catálogo de la demo no se modifica.

El formato (columnas obligatorias y opcionales) está definido en `src/utils/xlsx/schema.ts`. SheetJS se instala desde el CDN oficial (`xlsx-0.20.3`, la versión corregida; la de npm está desactualizada) y se carga solo al usar el importador.

## Tests y calidad

| Qué | Dónde |
|---|---|
| Unitarios y de componentes (388) | `src/**/*.test.ts(x)` |
| Accesibilidad con axe-core en jsdom (19 escenarios) | `src/a11y.test.tsx` |
| Contraste de color de cada paleta | `src/config/themes.test.ts` |
| Punta a punta en navegador real (143) | `e2e/*.spec.ts` |

Las pruebas E2E recorren la compra completa, la búsqueda, la barra de demo, el panel y el importador (con descarga y subida reales), el menú móvil, la ausencia de desborde horizontal a 375 px, y corren axe-core **incluyendo el contraste de color** en las pantallas de la tienda y del panel (incluidas las pestañas del editor, el detalle de pedidos y la vista previa del importador) × 5 paletas.

> **Poca RAM:** los tests unitarios usan 2 workers y Playwright 1 de forma predeterminada. Para una corrida liviana: `npx vitest run --maxWorkers=1 src/admin` o `E2E_CHANNEL=chrome npx playwright test admin.spec`. Evitá correr unitarias, E2E y build en una sola orden.

```bash
npx playwright install chromium          # una sola vez
npm run e2e
# o, usando el Chrome del sistema:
E2E_CHANNEL=chrome npm run e2e
# o contra un sitio ya desplegado:
E2E_BASE_URL=https://mi-demo.example npm run e2e
```

Mediciones con Lighthouse (build de producción, móvil): Home 96 / 100 / 100 / 100 y Producto 94 / 100 / 100 / 100 (rendimiento / accesibilidad / buenas prácticas / SEO). Las pantallas, salvo la Home, y el panel se cargan bajo demanda.

## Despliegue

Es un sitio estático: el build (`dist/`) se sirve con cualquier hosting, siempre que cualquier ruta que no sea un archivo devuelva `index.html` (React Router resuelve la pantalla).

- **Docker + nginx** (incluido): 
  ```bash
  docker build -t tienda-demo .
  docker run -p 8080:80 tienda-demo       # http://localhost:8080
  ```
  El `Dockerfile` compila con Node 22 y sirve con nginx; `nginx.conf` ya redirige las rutas a `index.html` y cachea los assets.
- **Vercel:** importar el repositorio; `vercel.json` ya define el rewrite y el cache de `/assets`.
- **Netlify:** importar el repositorio; `netlify.toml` ya define build, publicación y redirect.
- `public/robots.txt` deja fuera de los buscadores el admin, el carrito, el checkout y los pedidos.

## Estructura

```
src/
  config/       brand, themes, rutas, pantallas de la barra de demo
  data/         JSON de productos, categorías, bancos, sucursales
  services/     catalogService (acceso a datos), storeService, demoService
  utils/        formato, filtros, orden, carrito, pedidos, validadores, xlsx/
  context/      tema, moneda, carrito, avisos, barra de demo
  hooks/        useCart, useCurrency, useCatalogParams, …
  components/   layout/, catalog/, product/, cart/, checkout/, demo/, ui/
  pages/        Home, Category, Search, Product, Cart, Checkout, OrderDone, NotFound
  admin/        panel administrador demo (páginas, editor de producto, detalle de pedido)
e2e/            pruebas de punta a punta (Playwright)
scripts/        generador de productos
reference/      mockups originales (solo referencia de diseño)
docs/           plan de desarrollo y especificación original
```

Regla del proyecto: el código de uso general (formato de precios, validadores, slug, almacenamiento) vive en `src/utils/`, nunca dentro de una pantalla.
