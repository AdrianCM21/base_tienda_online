# Prompt para Claude Code — E-commerce "VOLTIA" en React

> Copiá todo lo que está debajo de la línea y pegalo en Claude Code. Si podés, adjuntá también los archivos de referencia `Ecommerce Home.dc.html`, `Ecommerce Categoria.dc.html`, `Ecommerce Producto.dc.html` y `Ecommerce Checkout.dc.html` (o los Standalone HTML) en una carpeta `/reference` del repo: son la fuente de verdad visual.

---

Construí un e-commerce en **React + Vite + TypeScript + React Router + Tailwind CSS** que replique **pixel a pixel** los mockups de referencia en `/reference/*.html`. Si hay diferencia entre este texto y los HTML de referencia, mandan los HTML. No inventes secciones, no agregues contenido extra, no cambies colores ni tipografías.

## 1. Setup

- `npm create vite@latest voltia -- --template react-ts`, luego Tailwind, `react-router-dom`, `lucide-react` (iconos, stroke 1.5–1.6).
- Fuentes Google: **Space Grotesk** (500/600/700) para títulos y logo; **Public Sans** (400/500/600/700) para todo el texto. No usar Inter/Roboto/Arial.
- Rutas:
  - `/` → Home
  - `/categoria/notebooks` → Listado de categoría
  - `/producto/:slug` → Detalle de producto
  - `/checkout` → Confirmar pago (2 pasos)
- Datos mock en `src/data/*.ts` (productos, bancos, categorías). Todo es placeholder.

## 2. Design tokens (exactos — configurarlos en `tailwind.config`)

| Token | Valor | Uso |
|---|---|---|
| primary | `#1D5FC1` | CTAs, precios, acentos, badges OFERTA, ítem activo |
| primary-hover | `#164A99` | hover de botones primarios |
| dark | `#0C2851` | header, footer, franja envío, textos fuertes, botón outline |
| light | `#E4ECF8` | chips, hover de listas, franja beneficios, bordes de tarjetas |
| bg | `#F4F8FC` | fondo general |
| text | `#101B2D` | texto principal |
| muted | `#3C5578` | texto secundario |
| subtle | `#8A97AA` | precio tachado, contadores, metadata |
| on-dark | `#C9D9EF` | texto/links sobre azul oscuro |
| on-dark-muted | `#9FB4D6` | texto secundario sobre azul oscuro |
| on-dark-link | `#9FC1EE` | link "Conocer más" |
| footer-copy | `#8FA6C9` | copyright |
| hero-text | `#D6E4F7` | párrafo del hero |

- Radios: tarjetas 8px, botones/inputs 6px, buscador 8px, chips de moneda 20px, hero image 14px.
- Bordes: `1px solid #E4ECF8` en tarjetas, sidebar, inputs.
- Sombra hover en tarjetas: `0 8px 20px rgba(12,40,81,0.10)`.
- Padding horizontal de página: 24px. Secciones: 48px vertical.
- Links globales: color `#1D5FC1`, hover `#0C2851`, sin subrayado.

## 3. Componentes compartidos

### TopBar (franja superior)
Fondo `#0C2851`, texto 12px `#C9D9EF`, padding 6px 24px, flex space-between.
- Izq: "Envíos a todo Paraguay | Retiro gratis en sucursales".
- Der (gap 18px): selector de moneda tipo píldora (contenedor `rgba(255,255,255,0.08)`, radio 20px, padding 2px; opción activa "Gs" con fondo `#1D5FC1` blanco bold, padding 3px 10px; inactiva "USD"), links "Ayuda" y "Sucursales". La moneda es estado global (Context) y alterna Gs/USD.

### Header
Fondo `#0C2851`, padding 18px 24px, flex, gap 28px, align center.
- Logo "VOLTIA": Space Grotesk 700, 28px, blanco, letter-spacing 0.5px, link a `/`.
- Buscador: `flex: 1 1 200px; min-width:120px; max-width:640px`, fondo blanco, radio 8px, overflow hidden. Input sin borde (padding 12px 16px, 14px, placeholder "Buscar productos, marcas y más...") + botón `#1D5FC1` con lupa blanca 18px, padding 0 18px, `flex-shrink:0`, hover `#164A99`.
- Cuenta (con `margin-left:auto`): icono usuario 22px `#C9D9EF` + dos líneas 13px: "Ingresá o registrate" (`#9FB4D6`) / "Mi cuenta" (blanco 600).
- Carrito: icono bolsa 26px blanco, badge circular 18px `#1D5FC1` con número (11px bold) en top:-6 right:-8. El contador sale de un CartContext.

### ProductCard
Fondo blanco, borde `#E4ECF8`, radio 8px, overflow hidden, columna flex.
- Badge "OFERTA" (sólo si hay `oldPrice`): absoluto top/left 10px, `#1D5FC1`, blanco, 11px bold, padding 3px 8px, radio 4px.
- Imagen 180px alto (170px en relacionados), object-fit cover, placeholder gris claro si no hay imagen.
- Cuerpo padding 14px, gap 6px:
  - (opcional, sólo listado) Marca: 11.5px, `#8A97AA`, 600, uppercase, letter-spacing 0.3px.
  - Nombre: 13.5px 600, line-height 1.3, min-height 36px.
  - Precio anterior tachado: 12.5px `#8A97AA`.
  - Precio: 19px 700 `#1D5FC1`.
  - Cuota: 12px `#3C5578` (ej. "12 cuotas de Gs. 382.500").
  - Botón "Agregar al carrito": `margin-top:auto`, borde 1.5px `#0C2851`, fondo transparente, texto `#0C2851` 600 13px, padding 9px, radio 6px; **hover: fondo `#0C2851`, texto blanco**, transición 150ms. Click suma al carrito.
- Grillas de productos: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px`.

### Footer
Fondo `#0C2851`, padding 48px 24px 0. Grid 4 columnas iguales, gap 28px, max-width 1200px centrado, padding-bottom 36px.
- Títulos de columna: blanco 700 14px, margin-bottom 14px. Links: 13.5px `#C9D9EF`, padding 4px 0, uno por línea.
- Columnas: **Categorías** (Informática, Electrónica, Electrodomésticos, Moda, Muebles) · **Ayuda** (Preguntas frecuentes, Envíos, Devoluciones, Garantías, Contacto) · **Empresa** (Sobre nosotros, Sucursales, Trabajá con nosotros, Términos y condiciones) · **Síguenos** (iconos Facebook, Instagram, YouTube 20px `#C9D9EF`, gap 12px).
- Copyright: borde superior `1px solid rgba(255,255,255,0.12)`, padding 16px, centrado, 12.5px `#8FA6C9`: "© 2026 Voltia. Todos los derechos reservados."

### Categorías (datos)
Informática, Electrónica, Electrodomésticos, Fotografía y Filmación, Perfumería y Belleza, Hogar y Jardín, Ferretería y Construcción, Automotriz y Motos, Moda, Muebles. Cada una con icono lucide y subcategorías anidadas. Ejemplo Informática:
- Notebooks y Equipos: Notebooks, Notebooks Gamer, All in One, Mini PC
- Componentes: Placas de Video, Procesadores, Memorias RAM, Discos y SSD
- Periféricos: Monitores, Teclados y Mouses, Impresoras, Sillas Gamer

**No hay menú horizontal de categorías en el header** — la navegación por categorías vive en la barra lateral.

## 4. Pantalla HOME (`/`)

Orden vertical: TopBar → Header → **[bloque con sidebar]** → Productos destacados → Franja envío gratis → Newsletter → Footer.

### 4.1 Bloque con sidebar (sólo cubre Hero + Beneficios)
Contenedor `display:flex; align-items:flex-start`.

**Sidebar de categorías** — ancho 264px, `flex-shrink:0`, fondo blanco, `border-right:1px solid #E4ECF8`, padding 18px 0, `position:sticky; top:0`. **No se estira al alto de la página** (altura = su contenido).
- Título "CATEGORÍAS": 12px 700 `#8A97AA` uppercase, letter-spacing 0.5px, padding 0 20px 12px.
- Ítem: flex, gap 10px, padding 12px 20px, 13.5px 600, icono lucide 18px `#1D5FC1` stroke 1.5; hover fondo `#E4ECF8`.
- Ítem activo (Informática): fondo `#E4ECF8`, texto `#1D5FC1` 700, y debajo se expanden sus subcategorías (padding 0 20px 14px 48px): títulos de grupo 12px 700 `#1D5FC1` uppercase; links 13px `#101B2D` padding 3px 0. Click en otra categoría la expande (acordeón, sólo una abierta).

**Main** (`flex:1; min-width:0`):

**Hero** — `background: linear-gradient(135deg, #0C2851, #1D5FC1)`, padding 56px 24px, flex wrap, gap 40px, align center.
- Columna texto (`flex:1 1 320px; min-width:280px; max-width:540px`):
  - Chip "Financiación propia": fondo `rgba(255,255,255,0.15)`, blanco, 12.5px 600, padding 5px 14px, radio 20px, mb 16px.
  - H1 "Hasta 18 cuotas sin interés en toda la tienda": Space Grotesk 700 40px, line-height 1.15, blanco, mb 16px.
  - Párrafo `#D6E4F7` 16px lh 1.5, mb 26px: "Comprá hoy y pagá cómodo con tu tarjeta de crédito. Válido en informática, electrónica y electrodomésticos."
  - Botón "Ver ofertas": fondo blanco, texto `#0C2851` 700 15px, padding 14px 28px, radio 8px, hover `#E4ECF8`.
- Columna imagen (`flex:1 1 240px; min-width:200px; max-width:460px`): imagen 100% × 300px, radio 14px.

**Beneficios con tu banco o cooperativa** — fondo `#E4ECF8`, padding 48px 24px.
- H2 26px 700 + subtítulo 14.5px `#3C5578` "Descuentos y cuotas especiales todos los meses." (mb 26px).
- Grid `repeat(auto-fit, minmax(200px,1fr))`, gap 18px. Tarjeta blanca radio 8px padding 22px: nombre del banco (Space Grotesk 700 16px `#0C2851`), beneficio (26px 700 `#1D5FC1`), condición (13px `#3C5578`, mb 14px), link "Ver más →" 13px 600.
- Datos: Banco Meridiano / 15% OFF / Los martes, tope Gs. 300.000 · Coop. Unión Paraguaya / 12 cuotas / Sin interés todos los días · Banco Sol / 10% OFF / Fines de semana · Banco Prisma / 18 cuotas / Sin interés en informática.

### 4.2 Productos destacados (ANCHO COMPLETO, fuera del bloque con sidebar)
Padding 48px 24px. Header flex space-between baseline: H2 "Productos destacados" 26px + link "Ver todos →" 14px 600. Grilla de 8 ProductCard:
1. Notebook Lenovo IdeaPad 15" Ryzen 5 8GB 256GB SSD — Gs. 4.590.000 (antes 5.190.000) — 12 cuotas de Gs. 382.500
2. Smart TV 55" 4K UHD — Gs. 3.290.000 — 10 cuotas de Gs. 329.000
3. Heladera No Frost 380L Inverter — Gs. 5.990.000 (antes 6.590.000) — 18 cuotas de Gs. 332.700
4. Cámara Mirrorless 24MP + Lente 18-55mm — Gs. 6.450.000 — 12 cuotas de Gs. 537.500
5. Set de Perfumería Femenina Edición Limitada — Gs. 890.000 (antes 1.050.000) — 6 cuotas de Gs. 148.300
6. Cortadora de Césped a Gasolina 4T — Gs. 2.190.000 — 10 cuotas de Gs. 219.000
7. Taladro Percutor Inalámbrico 20V + Maletín — Gs. 780.000 (antes 920.000) — 6 cuotas de Gs. 130.000
8. Sillón Reclinable de Living Tapizado — Gs. 2.890.000 — 12 cuotas de Gs. 240.800

### 4.3 Franja envío gratis (ancho completo)
Fondo `#0C2851`, padding 30px 24px, flex centrado, wrap, gap 16px. Icono camión 30px `#D6E4F7` + texto blanco 16px 600 "Envío gratis en compras superiores a Gs. 500.000 a todo el país" + link "Conocer más" `#9FC1EE` 14px 600 subrayado.

### 4.4 Newsletter (ancho completo, centrado)
Fondo `#F4F8FC`, padding 48px 24px, text-align center. H2 24px "Recibí ofertas exclusivas", párrafo 14.5px `#3C5578` "Suscribite y enterate antes que nadie de nuestras promociones." (mb 20px). Fila max-width 460px centrada, gap 10px: input email (padding 12px 14px, borde `#E4ECF8`, radio 6px) + botón "Suscribirme" `#1D5FC1` blanco 700 14px padding 12px 22px.

## 5. Pantalla LISTADO DE CATEGORÍA (`/categoria/notebooks`)

TopBar → Header → Breadcrumb → Título → [Sidebar + Resultados] → Footer.

- **Breadcrumb**: padding 16px 24px 0, 13px `#3C5578`: Inicio › Informática › **Notebooks** (último `#101B2D` 600; separador "›" con margin 0 4px).
- **Título**: padding 16px 24px 8px. H1 "Notebooks" 28px 700 + "128 productos" 13.5px `#3C5578` mt 4px.
- **Layout**: flex, gap 24px, padding 8px 24px 48px, `align-items:flex-start`.

**Sidebar** (260px, blanco, borde `#E4ECF8`, radio 8px, padding 20px):
1. "CATEGORÍAS" (12px 700 `#8A97AA` uppercase) + lista de las 10 categorías: cada link flex space-between, padding 8px 10px, radio 6px, 13.5px, con "›" a la derecha (`#8A97AA`). Activa (Informática): fondo `#E4ECF8`, `#1D5FC1` 700.
2. Separador (border-top `#E4ECF8`, pt 16px): "Filtros" 15px 700 + link "Limpiar" 12.5px.
3. Grupos de filtro (cada uno border-top + pt 16px + mb 16px, título 13.5px 600 mb 10px; checkbox con `accent-color:#1D5FC1`, label 13.5px padding 4px 0):
   - **Marca**: ASUS (34), HP (29), Lenovo ✓ (41), Dell (18), Acer (12) — contador a la derecha `#8A97AA`.
   - **Precio (Gs.)**: dos inputs "Desde"/"Hasta" (padding 8px 10px, 12.5px) + slider de rango: track 4px `#E4ECF8`, rango activo `#1D5FC1`, dos thumbs 14px blancos con borde 2px `#1D5FC1`.
   - **Procesador**: Intel Core i3, Intel Core i5 ✓, Intel Core i7, AMD Ryzen 5.
   - **Memoria RAM**: 4 GB, 8 GB ✓, 16 GB, 32 GB.
4. Botón "Aplicar filtros" ancho completo, `#1D5FC1`, blanco 700 13.5px, padding 11px, radio 6px.
Los filtros deben funcionar sobre los datos mock (marca, rango de precio, procesador, RAM).

**Resultados** (`flex:1`):
- Barra superior flex space-between, mb 18px: "Mostrando 1-9 de 128 resultados" (13.5px `#3C5578`) | "Ordenar por:" + dropdown (borde `#E4ECF8`, fondo blanco, padding 8px 12px, radio 6px, 600, chevron). Opciones: Más relevantes, Menor precio, Mayor precio, Más nuevos — debe reordenar.
- Grilla de 9 ProductCard con marca:
  1. Lenovo — IdeaPad 3 15" Ryzen 5 8GB 256GB SSD — 4.590.000 (antes 5.190.000) — 12 × 382.500
  2. ASUS — Vivobook 15 Intel i5 8GB 512GB SSD — 5.190.000 — 12 × 432.500
  3. HP — 250 G9 Intel i3 8GB 256GB SSD — 3.690.000 (antes 4.090.000) — 10 × 369.000
  4. Dell — Inspiron 15 Intel i7 16GB 512GB SSD — 7.890.000 — 18 × 438.300
  5. Acer — Aspire 5 Ryzen 5 8GB 256GB SSD — 4.290.000 — 12 × 357.500
  6. Lenovo — LOQ Gamer Intel i5 RTX 16GB 512GB — 9.490.000 (antes 10.290.000) — 18 × 527.200
  7. ASUS — ROG Strix Gamer Ryzen 7 16GB 1TB — 12.900.000 — 18 × 716.600
  8. HP — Pavilion 14 Intel i5 8GB 256GB SSD — 5.590.000 — 12 × 465.800
  9. Dell — Latitude 14 Intel i5 16GB 256GB SSD — 6.290.000 (antes 6.890.000) — 12 × 524.100
- **Paginación** centrada, mt 34px, gap 8px: botones 34×34, radio 6px, borde `#E4ECF8`: ‹ 1 2 3 4 5 ›. Activo: fondo `#1D5FC1`, blanco 700. "‹" deshabilitado `#8A97AA`.

Cada tarjeta enlaza a `/producto/:slug`.

## 6. Pantalla DETALLE DE PRODUCTO (`/producto/:slug`)

TopBar → Header → Breadcrumb (Inicio › Informática › Notebooks › **Lenovo IdeaPad 3 15" Ryzen 5**) → Detalle → Tabs → Relacionados → Footer.

**Detalle** (padding 20px 24px 0; grid 2 columnas `minmax(280px,1fr) minmax(320px,1fr)`, gap 36px):
- **Galería**: imagen principal 100% × 380px; debajo grid de 4 miniaturas 78px alto, gap 10px (mt 12px). Click en miniatura cambia la principal.
- **Info**:
  - Chip marca "LENOVO": fondo `#E4ECF8`, `#0C2851`, 11.5px 700 uppercase, padding 4px 10px, radio 4px, mb 10px.
  - H1 26px 700 lh 1.25: "Notebook Lenovo IdeaPad 3 15" Ryzen 5 8GB RAM 256GB SSD".
  - Fila: ★★★★★ (`#1D5FC1`) + "4.6 (128 opiniones)" 13px `#3C5578` + "| SKU VOLT-4021" `#8A97AA` (mb 18px).
  - **Caja precio** (blanca, borde, radio 8px, padding 20px, mb 20px): badge OFERTA, "Gs. 5.190.000" tachado 14px `#8A97AA`, "Gs. 4.590.000" 34px 700 `#1D5FC1`, "Ahorrás Gs. 600.000" 13px `#3C5578`, "12 cuotas de Gs. 382.500 sin interés" 14px 600 `#0C2851` mt 10px.
  - Stock: check + "En stock — Envío en 24 a 48hs" 13.5px 600 `#1D5FC1` (mb 20px).
  - Fila (gap 12px): selector cantidad (borde 1.5px `#E4ECF8`, radio 6px; botones − / + de 36×44, número 40px ancho) + botón outline "Agregar al carrito" flex:1 (mismo estilo outline→relleno, 700 14.5px, padding 12px).
  - Botón "Comprar ahora" ancho completo `#1D5FC1` 700 14.5px padding 13px → navega a `/checkout`.
  - Aviso banco: fondo `#E4ECF8`, radio 8px, padding 14px 16px, icono tarjeta, 13px `#0C2851`: "15% OFF con Banco Meridiano los martes. Ver todos los beneficios →".
  - Especificaciones principales (border-top, pt 16px): grid 2 columnas, label `#3C5578` / valor 600: Procesador AMD Ryzen 5 5500U · Memoria RAM 8 GB · Almacenamiento 256 GB SSD · Pantalla 15.6" Full HD · Sistema operativo Windows 11 Home.

**Tabs** (padding 40px 24px): fila gap 28px con border-bottom `#E4ECF8`: Descripción (activa: `#1D5FC1` 700 con borde inferior 2px) · Especificaciones · Opiniones (128). Contenido descripción 14.5px lh 1.7, max-width 760px. Tabs funcionales.

**Productos relacionados** (padding 0 24px 48px): H2 22px + grilla de 4 ProductCard (sin precio anterior): ASUS Vivobook 15 (5.190.000), HP 250 G9 (3.690.000), Mouse Inalámbrico Ergonómico (189.000, 3 × 63.000), Mochila Porta Notebook 15.6" (249.000, 3 × 83.000).

## 7. Pantalla CHECKOUT (`/checkout`) — 2 pasos

**Header simplificado**: fondo `#0C2851`, padding 16px 24px, logo VOLTIA 24px a la izquierda; a la derecha candado + "Compra 100% segura" 13px 600 `#9FC1EE`. (Sin TopBar, sin buscador.)

**Stepper**: fondo blanco, border-bottom `#E4ECF8`, padding 22px 24px, centrado, max-width 420px. Dos círculos 32px `#1D5FC1` unidos por línea 2px: paso 1 "Datos de envío" (con check si está completo), paso 2 "Forma de pago". Labels 12px.

**Layout**: padding 36px 24px 56px, max-width 1100px centrado, grid `minmax(280px,1fr) minmax(300px,380px)`, gap 28px.

**Columna izquierda** (gap 20px) — implementar como flujo real de 2 pasos con estado:
- **Paso 1 – Datos de envío**: formulario (Nombre y apellido, Teléfono, Dirección, Ciudad, Departamento, Código postal, opción Envío a domicilio / Retiro en sucursal) + botón "Continuar al pago". Al completarse se colapsa en tarjeta resumen: círculo check 24px + "1. Datos de envío" 15px 700 + link "Editar" a la derecha; debajo (padding-left 34px, 13.5px `#3C5578` lh 1.6): "María Fernández — Mcal. López 1234, Asunción / Depto. Central · CP 1209 · Tel. 0981 234 567".
- **Paso 2 – Forma de pago** (tarjeta blanca padding 24px): círculo "2" + título.
  - 3 opciones radio en fila (wrap, gap 10px, min-width 150px, padding 12px 14px, radio 6px, 13.5px 600): Tarjeta de crédito/débito (seleccionada: borde 1.5px `#1D5FC1`, fondo `#E4ECF8`) · Transferencia bancaria · Efectivo en sucursal (no seleccionadas: borde `#E4ECF8`, texto `#3C5578`).
  - Si es tarjeta: Número de tarjeta, Nombre en la tarjeta, Vencimiento (MM/AA) + CVV en fila, select Cuotas ("12 cuotas sin interés — Gs. 382.500/mes", "6 cuotas sin interés — Gs. 765.000/mes", "1 pago — Gs. 4.590.000"). Labels 12.5px 600 `#3C5578` mb 6px; inputs padding 11px 12px, borde `#E4ECF8`, radio 6px.
  - Si es transferencia: datos bancarios placeholder. Si es efectivo: selector de sucursal.
  - Checkbox "Acepto los términos y condiciones y la política de privacidad." 12.5px.

**Columna derecha – Resumen del pedido** (blanca, borde, radio 8px, padding 22px, `position:sticky; top:24px`, align-self start):
- Título 15px 700. Ítems del carrito: miniatura 56×56 + nombre 13px 600 + "Cantidad: 1" 12px `#8A97AA` + precio 13.5px 700 `#1D5FC1` (Notebook Lenovo IdeaPad 3 — Gs. 4.590.000; Mochila Porta Notebook 15.6" — Gs. 249.000).
- Subtotal Gs. 4.839.000 · Envío **Gratis** (`#1D5FC1` 600). Total 15px 700 / "Gs. 4.839.000" 24px 700 `#1D5FC1`. "o 12 cuotas de Gs. 403.250 sin interés" 12px.
- Botón "Confirmar pedido" ancho completo `#1D5FC1` 700 14.5px padding 14px (deshabilitado hasta completar paso 1 y aceptar términos). Debajo candado + "Pago procesado de forma segura" 12px `#8A97AA`.

**Footer simplificado**: fondo blanco, border-top `#E4ECF8`, padding 16px, centrado, 12.5px `#8A97AA`, copyright.

## 8. Comportamiento y calidad

- Estado global: `CurrencyContext` (Gs/USD, convertir precios con tasa mock 1 USD = 7.300 Gs) y `CartContext` (agregar, cantidad, total; el badge del header refleja la cantidad).
- Precios formateados con separador de miles con punto: `Gs. 4.590.000` / `USD 628,77`.
- Responsive: en < 900px la sidebar se convierte en un drawer (botón "Categorías"/"Filtros"); grillas con `auto-fit`; el detalle y el checkout pasan a una columna.
- Accesibilidad: foco visible `outline: 2px solid #1D5FC1; outline-offset: 2px`, labels en todos los inputs, botones reales (`<button>`), alt en imágenes.
- Estructura sugerida: `src/components/{TopBar,Header,Footer,CategorySidebar,ProductCard,FilterSidebar,Pagination,Stepper}.tsx`, `src/pages/{Home,Category,Product,Checkout}.tsx`, `src/data/{products,categories,banks}.ts`, `src/context/{Cart,Currency}Context.tsx`.
- Imágenes: usar placeholders (`/public/placeholder.svg` o fondo `#E4ECF8`) hasta tener fotos reales.
- Al terminar, abrí cada ruta y comparala visualmente con su HTML de referencia en `/reference`; corregí cualquier diferencia de espaciado, tamaño o color.
