# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos: ver `specs/`.

Estado actual observado:

- `/dashboard` es un Server Component (`app/dashboard/page.js`) que valida `pageIdentity(['user','admin'])` y muestra el saludo. `proxy.js` autoriza y cuenta la entrada, pero su `matcher` solo cubre `/dashboard`, `/pending` y `/users/:path*`: cualquier ruta nueva de datos queda fuera y debe verificar sesión y rol por sí misma.
- El proyecto no tiene `public/`, ni `d3`, ni código de gráficas. Usa JavaScript, App Router, Server Components por defecto y versiones exactas en `package.json`.
- `tests/browser.test.mjs` busca el encabezado `/^Hola/` en `/dashboard` (líneas 195 y 230) y deberá actualizarse.
- Origen (artefacto): HTML con CSS propio y tokens del runtime (`--cds-*`, `--color-*`), 3 scripts (`calc.js`, `tablas.js`, `graficas.js`) que usan `dash.calc`, `dash.loader`, `dash.params`, `dash.draw` y `d3`, más 4 datasets en formato `{columns, rows}`: `semanal3` (156 KB, 3 034 filas), `tiendas3` (1.9 MB, 14 395 filas), `puntos` (495 KB, 4 730 filas) y `presencia_sams`, además de la geometría `window.GEO` (123 KB) y 5 logotipos.
- La lógica de `calc.js` se compone de `loader` (tiendas, semanal, puntos) y de `calc` (`kpi`, `ocho`, `por_cadena`, `por_estado`, `por_articulo`, `heat`, `serie`, `inv_serie`, `puntos_m`, `alertas`, `top_*`, `pedido`, `acciones`, `destacados`). Varios dependen de los filtros (`dash.params`).

## Goals / Non-Goals

**Goals:**
- Reproducir el dashboard del artefacto con el mismo aspecto, textos, fórmulas y comportamiento de filtros, sin el runtime `dash`.
- Mantener los datos privados: solo salen del servidor hacia una sesión Usuario o Administrador.
- Separar cálculo (funciones puras, comprobables) de presentación.

**Non-Goals:**
- Leer Excel o Google Drive, o automatizar la generación semanal de los JSON (cambio posterior).
- Rediseñar, traducir o "mejorar" el dashboard, ni cambiar fórmulas.
- Usar MongoDB, cambiar roles, autenticación o la analítica de entradas.
- Comparar el resultado contra el artefacto de forma automática en producción.

## Decisions

### 1. Cálculo en el navegador, sobre los datos completos
El navegador descarga una vez los datos y recalcula al cambiar filtros, como hace el artefacto. Las funciones de cálculo viven en un módulo puro (`backend/dashboard/calc.mjs`, sin `server-only`) importado por el componente cliente y por las pruebas.
- Alternativa: calcular en el servidor por filtro. Descartada: cada cambio de filtro sería una petición, y obligaría a rediseñar la lógica del artefacto, que es interactiva y usa los filtros en casi todo.
- Costo: ~2.7 MB de JSON sin comprimir (Vercel comprime la respuesta). Aceptable para un portal interno, medir en la primera carga.

### 2. Datos como JSON importados en un módulo de servidor
Los JSON viven en `backend/dashboard/data/` y los importa un módulo con `import 'server-only'`, que solo usa el endpoint. Al ser importados, quedan en el bundle del servidor (y en el de la función de Vercel) sin configuración extra, y nunca en `public/` ni en el bundle del cliente.
- Alternativa: `fs.readFile` en tiempo de ejecución. Descartada: requiere `outputFileTracingIncludes` para que Vercel incluya los archivos y es más frágil.
- Alternativa: almacenamiento externo (Vercel Blob, MongoDB). Descartada por la decisión del usuario: archivos JSON en el servidor, sin MongoDB.
- Se conserva el formato `{columns, rows}` del artefacto para poder reemplazar archivos sin tocar el cálculo; un único módulo de carga valida columnas esperadas y falla con error claro si faltan.

### 3. Un endpoint de solo lectura que valida por sí mismo
`app/api/dashboard/data/route.js` (GET) resuelve la identidad con `getIdentity(request.headers)` y `requireRole(identity, ['user','admin'])`, y responde 401 sin sesión y 403 con otro rol, antes de leer los datos. Responde JSON con `cache-control: private, no-store`. No se agrega a `matcher` de `proxy.js`: el proxy registra entradas por navegación de documento y la petición `fetch` no lo es; la verificación en el propio endpoint cumple "cada operación protegida verifica sesión y rol actual".
- Alternativa: pasar los datos como props del Server Component. Descartada: los 2.7 MB irían serializados en el HTML/RSC y el HTML inicial debe poder leerse sin datos (spec `application-runtime`).
- La respuesta incluye los 4 conjuntos de datos, la geometría de estados y la etiqueta del corte, para que el cliente haga una sola petición.

### 4. Servidor entrega la estructura, cliente entrega la interacción
`app/dashboard/page.js` sigue siendo Server Component: valida el rol, renderiza `PortalHeader`, el `<h1>` del título y la estructura estática (encabezado, filtros, pestañas). Un componente `"use client"` (`components/dashboard/…`) obtiene los datos, mantiene el estado de filtros y pestañas y dibuja tablas y gráficas. Así el HTML inicial es útil sin JavaScript y el `<h1>` es único.

### 5. Gráficas y mapa con d3 sobre contenedores propios
Se instala `d3` con versión exacta. Las gráficas (líneas con tendencia, barras, mapas de calor, mapa con `geoMercator`/`geoPath`) se portan casi tal cual de `graficas.js`: d3 dibuja dentro de un contenedor referenciado por `ref`, que React no puebla con hijos, y se redibuja al cambiar datos, filtros o ancho. Los indicadores de valor (tooltip) se mantienen dentro del contenedor.
- Alternativa: reescribir con React + SVG. Descartada: más trabajo y mayor riesgo de diferencias visuales frente al "exactamente como el artefacto".
- Tablas, KPIs y listas se renderizan con JSX a partir del resultado de `calc`.

### 6. Estilos aislados y sin tokens del runtime
El CSS del artefacto se porta a una hoja con alcance bajo la clase `.ch` (como el original) y sustituye `--cds-*` y `--color-*` por variables locales con los valores equivalentes (azules de marca, semáforos, `--bd`, `--ok`). Las reglas de impresión del original se conservan. Se evitan estilos globales sobre `body` o etiquetas para no alterar el resto del portal.
- Los logotipos (no sensibles) se guardan en `public/dashboard/`; es el único contenido bajo `public/`.

### 7. Etiqueta del corte en una sola configuración
El texto "semana 46 (9 al 15 de noviembre de 2026)" se define una vez en el módulo de datos y se usa en encabezado, pestañas y notas. Cuando exista la actualización semanal (cambio posterior) bastará cambiar esa configuración junto con los JSON.

### 8. Verificación de las cifras
Las pruebas del módulo de cálculo recalculan de forma independiente, desde los datos crudos, las cifras de referencia sin filtros (venta acumulada, variación, unidades, semana del corte, pisos, consolidado y resultados por cadena) y comprueban los filtros, la tendencia y las alertas. La comparación directa con el artefacto renderizado se hace en la revisión manual, porque su código de cálculo no se ejecuta fuera de su entorno.

### 9. Normalización de los límites de estados
`estados.json` se conserva tal como vino del artefacto y se normaliza al cargarlo: se cierran los anillos abiertos, se descartan los de menos de 4 posiciones o sin área y se orientan en el sentido que exige `d3-geo` (exterior horario, huecos antihorario). Sin esto el mapa se rellena por completo, porque 8 estados traen orientación mezclada.

## Risks / Trade-offs

- [Los datos de negocio quedarían versionados en GitHub (`ing17romc/auto-servicio`); no pude comprobar su visibilidad] → Verificar que el repositorio sea privado antes de confirmar los JSON; si es público, no versionarlos y cargarlos por otro medio (decisión del usuario antes de aplicar).
- [Fidelidad parcial al portar el CSS por los tokens del runtime] → Comparar visualmente con capturas del artefacto en escritorio y móvil y ajustar variables.
- [Carga inicial pesada (~2.7 MB sin comprimir)] → Una sola petición con compresión, estado de carga visible y medición en el despliegue; si es lenta, dividir `tiendas3` por pestaña en un cambio posterior.
- [Un error en una fórmula portada cambia cifras de negocio sin avisar] → Pruebas con cifras de referencia del artefacto y revisión de cada `calc` contra el original.
- [El endpoint queda fuera del `matcher` del proxy] → Prueba de integración 401/403/200 y revisión de que ninguna otra ruta de datos exista sin verificación.
- [`d3` suma peso al bundle cliente] → Importar solo los módulos usados (`d3-scale`, `d3-shape`, `d3-geo`, `d3-selection`, `d3-axis`, `d3-array`, `d3-format`) en lugar de la agrupación completa si el tamaño lo justifica.
- [Los `.json` se reemplazan a mano cada semana] → Documentado en el README; la automatización es un cambio posterior.

## Migration Plan

1. Implementar y verificar en local con `npm run lint`, `npm run build`, `npm test` y `npm run test:e2e`.
2. No hacer push ni despliegue como parte de implementar; la publicación se solicita aparte y revisa variables privadas y callbacks de Google como indica el README.
3. Rollback: revertir el cambio en `master` devuelve `/dashboard` al saludo; no hay migración de datos ni esquema.
