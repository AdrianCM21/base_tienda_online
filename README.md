# Tienda Demo — demo de catálogo de productos

Demo web de catálogo (React + Vite + TypeScript + Tailwind v4). Plan completo en `docs/Plan de desarrollo - Demo de catalogo.md`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (http://localhost:5173) |
| `npm run build` | Typecheck + build de producción |
| `npm test` | Tests (Vitest) |
| `npm run lint` / `npm run format` | oxlint / Prettier |

## Personalización

- **Marca:** `src/config/brand.ts` (único lugar donde se escribe el nombre; `index.html` y los títulos lo toman de ahí).
- **Paletas:** `src/config/themes.ts`. Si cambiás el tema por defecto (azul), actualizá también los valores de `@theme` en `src/index.css` (un test lo verifica).
- **Rutas:** `src/config/routes.ts`.

## Referencia visual

`reference/` contiene los mockups originales (HTML standalone) y `reference/extracted/` sus recursos y markup descomprimidos. Son solo referencia de diseño: no se importan en la app.

## Estado

Fases 0 a 9 completas (hasta el pulido). Siguiente: Fase 10 (QA y entrega).

Los pedidos del checkout se guardan en `localStorage` (clave `tienda-demo:orders`, sin datos de tarjeta salvo los últimos 4 dígitos) y alimentarán el panel admin.

En desarrollo, `/componentes` muestra una galería de los componentes compartidos.

## Datos

`src/data/products.json` se genera con `npm run generate:products` (semilla fija) a partir de `scripts/generate-products.ts`; las categorías se editan a mano en `src/data/categories.json`. Las pantallas acceden al catálogo solo mediante `src/services/catalogService.ts`.

## Barra de demo

Franja superior para saltar entre pantallas al presentar (Inicio, Categoría, Búsqueda, Producto, Carrito, Checkout, Confirmación, Admin). Carrito, Checkout y Confirmación se preparan solos con datos de ejemplo. Incluye selector de paleta y "Reiniciar demo".

- Ocultar: botón ✕ (se recuerda) o `?demo=0` en la URL (solo esa pestaña). `?demo=1` la vuelve a mostrar.
- Quitarla del build: `VITE_DEMO_BAR=false npm run build`.
- Pantallas y datos de ejemplo: `src/config/demoScreens.ts`.

## Panel administrador demo (`/admin`)

Acceso con el botón "Entrar como demo" (no hay cuentas reales). Secciones: Dashboard, Productos, Importar XLSX, Pedidos, Categorías, Apariencia y Configuración. Es de muestra: las acciones de edición solo avisan que no están disponibles, salvo Apariencia (cambia la paleta de la tienda) y el importador. Los pedidos del checkout aparecen en Pedidos junto a pedidos de ejemplo. El panel es `noindex`.

### Importador XLSX

1. En **Importar XLSX** descargá la plantilla (4 hojas: Productos, Variantes, Especificaciones e Instrucciones con todas las columnas).
2. Completala y subila: se valida fila por fila (hoja, fila, columna y motivo), con vista previa y descarga de los problemas en CSV.
3. "Importar" **simula** el resultado: el catálogo de la demo no se modifica.

El formato (columnas obligatorias y opcionales) está definido en `src/utils/xlsx/schema.ts`. SheetJS se instala desde el CDN oficial (`xlsx-0.20.3`, la versión corregida; la de npm está desactualizada) y se carga solo al usar el importador.

## Calidad

- **Accesibilidad:** `src/a11y.test.tsx` corre axe-core sobre las pantallas de la tienda y del panel (sin violaciones). El contraste de color se verifica por tema en `src/config/themes.test.ts` (AA en los pares de color críticos, en las 5 paletas).
- **Responsive:** auditado a 360, 768 y 1280 px en todas las rutas, sin desborde horizontal.
- **Rendimiento:** las pantallas (salvo Home) y el panel admin se cargan bajo demanda, con un esqueleto mientras tanto. Lighthouse (build de producción, móvil): Home 96 / 100 / 100 / 100 y Producto 94 / 100 / 100 / 100 (rendimiento / accesibilidad / buenas prácticas / SEO).
- **SEO:** `<title>` y meta description por ruta; carrito, checkout, pedido, 404 y admin son `noindex`; `public/robots.txt`.
