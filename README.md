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

Fases 0 a 7 completas (hasta el checkout simulado). Siguiente: Fase 8 (panel admin demo + importador XLSX).

Los pedidos del checkout se guardan en `localStorage` (clave `tienda-demo:orders`, sin datos de tarjeta salvo los últimos 4 dígitos) y alimentarán el panel admin.

En desarrollo, `/componentes` muestra una galería de los componentes compartidos.

## Datos

`src/data/products.json` se genera con `npm run generate:products` (semilla fija) a partir de `scripts/generate-products.ts`; las categorías se editan a mano en `src/data/categories.json`. Las pantallas acceden al catálogo solo mediante `src/services/catalogService.ts`.
