# Plan del panel administrador — hacerlo competitivo y atractivo

> Complementa `Plan de desarrollo - Demo de catalogo.md` (§8 y §9). Parte del análisis del panel construido en las Fases 8 y 9.
> Estado: **Etapas A, B, C y D completas**.

## 1. Objetivo y principios

El panel es una **vitrina para que los posibles clientes se hagan una idea** de cómo sería administrar su negocio. No es un producto con backend. De ahí salen tres principios:

1. **Demostrativo, no funcional.** Las acciones de edición no modifican el catálogo ni se guardan. Lo que hoy funciona de verdad **se mantiene**: la validación del importador, la paleta en Apariencia y los pedidos del checkout que aparecen en Pedidos. Lo nuevo puede *sentirse* vivo dentro de una pantalla (estado en memoria que se pierde al recargar), pero nunca persiste ni toca la tienda.
2. **Multirubro.** Debe servir igual para ferretería, tecnología, moda, hogar, etc. Sin vocabulario ni campos pensados para un solo rubro: variantes por **color, talle o medida**, **unidad de venta** (unidad, metro, kg, caja, par), especificaciones libres y datos de ejemplo repartidos entre rubros.
3. **Que se vea como un panel profesional.** Navegación agrupada, tablas con orden y selección, editor de producto completo, flujo de pedidos con estados, y detalles de pulido (avisos, estados vacíos, móvil).

## 2. Diagnóstico (resumen)

| Problema | Consecuencia |
|---|---|
| Menú plano de 7 ítems; "Importar" como sección | Se ve como una maqueta, no como un panel de gestión |
| Editar, eliminar y "Nuevo" solo muestran un aviso | Pierde credibilidad al presentarlo |
| Tablas duplicadas (Productos, Pedidos, previsualización) sin orden ni selección | Poco práctico y código repetido |
| Pedidos sin flujo de estados | No muestra cómo se gestiona una venta |
| Dashboard solo informativo | No dice qué hacer |
| Importar no muestra qué cambiaría | Falta lo que más se usa en la vida real: actualizar precios y stock por SKU |

## 3. Nueva organización

```
Inicio            → resumen del negocio
Ventas            → Pedidos · Clientes (luego: Carritos abandonados)
Catálogo          → Productos          (Importar y Exportar viven acá adentro)
                    Categorías · Inventario
Marketing         → Cupones · Beneficios con bancos · Banners y destacados
Reportes          → Ventas · Productos · Categorías y pagos
Tienda            → Apariencia · Configuración
```

Rutas: `/admin` · `/admin/pedidos` · `/admin/productos` · `/admin/productos/nuevo` · `/admin/productos/:id` · `/admin/productos/importar` · `/admin/categorias` · `/admin/apariencia` · `/admin/configuracion`. La ruta anterior `/admin/importar` redirige a la nueva.

## 4. Etapas

### Etapa A — Base profesional ✅ completa
- **A1. Navegación agrupada** por secciones (Ventas, Catálogo, Tienda), "Dashboard" pasa a **Inicio**, y una barra superior con campanita de avisos (pedidos nuevos hechos en esta demo) y acceso a la tienda. Importar pasa a vivir dentro de Productos.
- **A2. Tabla de datos común** (`DataTable`): orden por columna, búsqueda, selección múltiple con barra de acciones, paginación y vista de tarjetas en móvil. Reemplaza las tablas duplicadas de Productos y Pedidos.
- **A3. Editor de producto** (`/admin/productos/:id` y `/nuevo`), con pestañas: General · Precios y ofertas · Inventario · Variantes (color / talle / medida) · Imágenes · Especificaciones · SEO (con vista previa tipo buscador). Se llena con los datos del producto y se puede editar en pantalla; "Guardar" avisa que es una demo.
- **A4. Flujo de pedidos**: estados (pendiente, confirmado, preparando, enviado, entregado, cancelado), detalle con línea de tiempo, cambio de estado en pantalla, notas internas, contacto por WhatsApp, copiar resumen, filtros (estado, pago, período, búsqueda) y **exportación a CSV real**.
- **A5. Importar y exportar**: modos de importación (crear y actualizar por SKU · solo crear nuevos · solo precios y stock), **vista previa de cambios** contra el catálogo ("N nuevos, M actualizados, K sin cambios") y **exportar el catálogo a XLSX** en el mismo formato del importador (ida y vuelta sin errores). La importación sigue siendo simulada.

**Hecho cuando:** se puede recorrer todo el panel agrupado, abrir y editar (en pantalla) cualquier producto, mover un pedido por sus estados, exportar pedidos a CSV y el catálogo a XLSX, y ese XLSX se vuelve a subir mostrando todo "sin cambios".

### Etapa B — Inteligencia del negocio ✅ completa
Inicio v2 (selector de período, variación contra el período anterior, ventas por categoría y por medio de pago, tareas pendientes), sección **Reportes**, **Clientes** (derivados de los pedidos) e **Inventario** (alertas por umbral, stock por variante).

### Etapa C — Crecimiento y configuración ✅ completa
**Marketing** (cupones, beneficios con bancos editables, banners y destacados), **Configuración real** (zonas y tarifas de envío, medios de pago, impuestos, horarios, WhatsApp, usuarios y roles de muestra), **buscador global** (Ctrl+K), checklist de inicio y vista previa de marca más completa.

### Etapa D — Productividad ✅ completa
Acciones en lote completas, exportaciones adicionales, registro de actividad, atajos de teclado, modo oscuro y estilo propio del admin (neutro, con la paleta de la marca solo como acento).

## 5. Decisiones confirmadas

1. El panel **no necesita funcionar de verdad**: es para que se hagan una idea. Se conserva lo que ya funciona.
2. **Multirubro**: no se encasilla en un rubro (ferretería, tecnología, moda, etc.).
3. Se arranca por la **Etapa A**.

## 6. Criterios de calidad (todas las etapas)
- Mismo nivel de pruebas que el resto del proyecto: unitarias, componentes y E2E.
- Accesibilidad con axe (incluido contraste) en cada pantalla nueva, en las 5 paletas.
- Sin desborde horizontal en móvil.
- Todo estado "de muestra" debe ser evidente para quien mira (avisos, textos) y reiniciable con "Reiniciar demo".

## 7. Resultado de la Etapa A

- **Navegación** agrupada (Inicio · Ventas · Catálogo · Tienda), barra superior con campanita (pedidos hechos en la demo) y acceso a la tienda. Importar y Exportar viven en Productos; `/admin/importar` redirige.
- **`DataTable` común** (orden con `aria-sort`, selección con acciones en lote, paginación, tarjetas en móvil sin duplicar el DOM) usada en Productos y Pedidos.
- **Editor de producto** con 7 pestañas, variantes por color, talle y medida, unidad de venta, imágenes con vista previa, especificaciones y vista previa tipo buscador; indicador de cambios sin guardar. Guardar avisa que es una demo.
- **Pedidos con flujo**: 6 estados, línea de tiempo, avanzar/cancelar/reabrir (solo en pantalla), notas, WhatsApp, copiar resumen, filtros y **exportación CSV real**.
- **Importar/Exportar**: 3 modos, vista previa de cambios contra el catálogo y **exportación XLSX real** que se vuelve a subir mostrando todo "sin cambios".
- **Corrección de fondo**: `Drawer` y `ConfirmDialog` usan la última versión de `onClose`/`onCancel` sin reiniciar su efecto; antes, si el padre pasaba una función nueva en cada render, el panel le robaba el foco al campo que se estaba escribiendo.
- **Calidad**: pruebas unitarias y de componentes de todo lo nuevo, y E2E con axe (incluido contraste) en todas las pantallas nuevas × 5 paletas.

## 8. Resultado de la Etapa B

- **Inicio v2**: selector de período (7, 14 o 30 días); KPIs de ventas, pedidos y ticket promedio con **variación contra el período anterior**; gráfico del período; **"Por hacer"** (pedidos por preparar o enviar, pendientes de pago, productos sin stock, stock bajo, borradores) con enlaces a la lista ya filtrada; ventas por categoría y por medio de pago (barras de participación); más vendidos del período y stock bajo por variante.
- **Reportes** (`/admin/reportes`): Ventas (KPIs, gráfico y tabla diaria), Productos (ranking ordenable) y Categorías y pagos. Cada reporte se exporta a **CSV real**.
- **Clientes** (`/admin/clientes`): derivados de los pedidos (agrupados por teléfono; los cancelados no suman al gasto), con segmentos Nuevo / Recurrente / VIP, buscador, detalle con historial de pedidos (enlazados) y WhatsApp, y exportación a CSV. Los pedidos hechos en la tienda crean o suman a un cliente.
- **Inventario** (`/admin/inventario`): una fila por producto o por variante, resumen (unidades, valor del inventario, agotados, stock bajo), **umbral configurable** de stock bajo, filtros y exportación a CSV. "Reponer" avisa que es una demo.
- **Datos de ejemplo más creíbles**: 90 pedidos en 60 días (permite comparar 30 contra 30), 60 clientes con teléfono propio y compras que se repiten con distinta frecuencia, y estados que dependen de la antigüedad. Los cancelados no cuentan como venta.
- **Navegación**: grupos Ventas (Pedidos, Clientes), Catálogo (Productos, Categorías, Inventario), Reportes y Tienda.
- **Calidad**: pruebas unitarias de cada cálculo (período, variación, series, rankings, segmentos, inventario) y de cada pantalla; E2E con axe y contraste en las 5 paletas para Inicio, Reportes (3 pestañas), Clientes (con detalle) e Inventario.

## 9. Resultado de la Etapa C

- **Buscador global (Ctrl+K / ⌘K)**: desde cualquier pantalla del panel (o con el botón "Buscar" de la barra superior) encuentra secciones, productos (nombre, marca, SKU), pedidos (número, cliente) y clientes (nombre, teléfono, ciudad). Flechas para moverse, Enter para abrir, Esc para cerrar; cada apertura empieza vacía.
- **Marketing**:
  - **Cupones**: lista con los 5 estados (activo, programado, vencido, agotado, pausado), resumen, interruptor para pausar y formulario lateral con validación y vista previa de lo que ve el cliente.
  - **Beneficios con bancos**: lista editable (mostrar/ocultar, editar, agregar, quitar) con la vista previa de la Home, reutilizando la misma tarjeta de la tienda (`BankCard`).
  - **Banners y destacados**: editor del banner principal con vista previa y orden de los productos destacados (subir, bajar, quitar, agregar, tope de 8).
- **Configuración en 5 pestañas**: General (datos, WhatsApp, horarios, redes), Envíos (zonas y tarifas, envío gratis, retiro en sucursal), Pagos (tarjeta con cuotas, transferencia, efectivo), Impuestos (IVA incluido o no, con ejemplo calculado, datos fiscales) y Usuarios y roles (usuarios, invitación con validación y matriz de permisos).
- **Guía de inicio** en Inicio: 6 pasos que se marcan solos al pasar por cada pantalla (o al hacer una venta de prueba), con barra de progreso y opción de ocultarla.
- **Apariencia más completa**: color principal propio con aviso de contraste del texto blanco, subida de logo (vista previa) y vista previa de la tienda con encabezado, banner y tarjeta de producto.
- Todo es **de muestra**: se edita en pantalla y no se guarda; "Reiniciar demo" borra el avance de la guía.
- **Calidad**: unitarias de cupones, buscador, impuestos, roles y contraste; pruebas de cada pantalla; axe en jsdom y en navegador real (con contraste) para las pantallas nuevas.

## 10. Resultado de la Etapa D

- **Acciones en lote reales** (solo en pantalla): en Productos (activar, pasar a borrador, cambiar precio en % con validación entre -90 y +200, eliminar con confirmación, exportar selección) y en Pedidos (marcar confirmado, preparando, enviado, entregado o cancelar, exportar selección). Todas avisan con un toast que incluye **Deshacer**.
- **Exportaciones** a CSV real: lista filtrada y selección de Productos, selección de Pedidos, Cupones, Categorías y resumen de Inicio (KPIs y serie diaria), además de las que ya existían.
- **Registro de actividad** (`/admin/actividad`): quién hizo qué y cuándo; mezcla acciones de ejemplo con las tuyas (login, lotes, cambios de estado, cupones, exportaciones), con filtros por tipo, buscador, exportación a CSV y "Borrar mis acciones". Se guarda en el navegador y "Reiniciar demo" lo borra.
- **Atajos de teclado**: Ctrl+K busca; `?` abre la ayuda; `g` + letra navega (i Inicio, p Productos, c Clientes, o Pedidos, n Inventario, m Cupones, r Reportes, a Actividad, s Configuración). Se ignoran al escribir y con diálogos abiertos, y se pueden desactivar (WCAG 2.1.4).
- **Estilo propio del admin**: scope `.admin-theme` en gris neutro con la paleta de la tienda solo como acento, y **modo oscuro** (botón en la barra superior, se recuerda). En oscuro el acento se aclara y los colores de estado tienen tonos propios; un test verifica el contraste AA parseando `index.css`. La vista previa de Apariencia queda aislada del tema del panel.
- **Calidad**: unitarias de lotes (`bulkProducts`), actividad, atajos y contraste oscuro; pruebas de pantalla en `stageD.test.tsx`.
