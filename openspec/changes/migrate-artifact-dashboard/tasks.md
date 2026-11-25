# Tasks

## 1. Preparación y material de origen

- [x] 1.1 Confirmar con la persona responsable que el repositorio `ing17romc/auto-servicio` es privado antes de versionar datos de negocio; si no lo es, detenerse y acordar otra forma de cargar los JSON. Verificación: respuesta registrada en el cambio antes de crear los archivos de datos. Confirmado por la persona responsable: el repositorio es privado.
- [x] 1.2 Descargar del artefacto los 4 conjuntos de datos, la geometría de estados y los 5 logotipos; guardar los JSON en `backend/dashboard/data/` y los logotipos en `public/dashboard/`. Verificación: los tamaños y hashes coinciden con los del artefacto (156 KB, 1.9 MB, 495 KB, geometría de 123 KB) y `git status` solo muestra esos archivos nuevos.
- [x] 1.3 Definir las cifras de referencia sin filtros de forma independiente, recalculándolas desde los datos crudos en las pruebas (venta acumulada, variación, unidades, semana del corte, pisos, consolidado, resultados por cadena). Verificación: `tests/dashboard.test.mjs` las compara con el cálculo portado. Nota: el artefacto renderizado no estaba disponible para extraer cifras y no se ejecutó su código; la comparación contra sus cifras queda para la revisión manual de 7.3.
- [x] 1.4 Instalar `d3` con versión exacta (`npm install --save-exact`) y confirmar que `npm ci` sigue funcionando. Verificación: `npm ci` y `npm run build` terminan sin errores y `npm run skills:check` pasa.

## 2. Datos y endpoint protegido

- [x] 2.1 Crear el módulo de servidor `backend/dashboard/` (`import 'server-only'`) que carga los JSON, valida las columnas esperadas y expone la etiqueta del corte desde una sola configuración. Verificación: prueba que falla con mensaje claro si falta una columna y que importa sin acceder a MongoDB.
- [x] 2.2 Crear `app/api/dashboard/data/route.js` (GET) que verifique sesión y rol Usuario o Administrador, responda 401/403 antes de leer datos y devuelva JSON con `cache-control: private, no-store`. Verificación: pruebas de integración de 401 sin sesión, 403 con rol Pendiente y 200 con Usuario y Administrador, siguiendo el estilo de `tests/portal.integration.test.mjs`.
- [x] 2.3 Comprobar que los datos no son públicos. Verificación: prueba que `GET` a rutas bajo `/dashboard/…` y a `/backend/…` de los archivos devuelve 404, y que el bundle cliente construido no contiene filas de datos (búsqueda de un valor único de `tiendas3` en `.next/static`).

## 3. Cálculos

- [x] 3.1 Portar `loader` (tiendas, semanal, puntos) y `calc` (`kpi`, `ocho`, `por_cadena`, `por_estado`, `por_articulo`, `heat`, `serie`, `inv_serie`, `puntos_m`) a `backend/dashboard/calc.mjs` como funciones puras con filtros explícitos, sin `dash`. Verificación: pruebas unitarias comparan con el fixture de 1.3 (venta acumulada 2026, variación, unidades, venta y variación de la semana 46, pisos).
- [x] 3.2 Portar `alertas`, `top_bodega`, `top_sinventa`, `top_faltante`, `top_sobre`, `top_caida`, `pedido`, `acciones` y `destacados`. Verificación: pruebas con filtros de cadena, estado y artículo, y revisión línea a línea contra `calc.js` del artefacto.
- [x] 3.3 Cubrir el comportamiento del filtro de estado en la tendencia (no lo aplica) y el plan operativo (venta 2025 más 10 por ciento). Verificación: pruebas con esos escenarios de la spec.

## 4. Interfaz: estructura, filtros, tablas y KPIs

- [x] 4.1 Reemplazar `app/dashboard/page.js` por el Server Component con `PortalHeader`, `<h1>` del título y estructura estática, y sustituir el saludo. Verificación: con JavaScript deshabilitado el HTML incluye el único `<h1>`, `lang="es"` y el título `General Dashboard`, y no incluye datos de venta.
- [x] 4.2 Crear el componente cliente con carga de datos, estados de carga y error, filtros de Cadena, Estado y Artículo, chips con logotipo, "Quitar filtros" y las 6 pestañas con roles ARIA. Verificación: prueba de navegador que cambia pestañas y filtros, y que ante un error de red muestra el mensaje sin cifras.
- [x] 4.3 Portar el CSS del artefacto bajo `.ch` con variables locales (sin `--cds-*`) y las reglas de impresión, y renderizar KPIs, frase de resumen y tablas de las secciones 1 a 6. Verificación: comparación visual con el artefacto en escritorio y 320 px, sin desbordamiento horizontal de la página.

## 5. Gráficas y mapa

- [x] 5.1 Portar la tendencia de venta en pesos y unidades (S1–S46 reales, S47–S52 proyectadas), el inventario semanal y las barras de estado y artículo con d3 sobre contenedores propios. Verificación: prueba de navegador comprueba que las series existen y que el filtro de cadena las redibuja.
- [x] 5.2 Portar el mapa de México (`geoMercator`, tiendas por estado), los mapas de calor por producto y cadena y los indicadores de valor al señalar. Verificación: prueba de navegador que señala un elemento y ve el valor dentro del área del dashboard; revisión visual contra el artefacto.

## 6. Documentación y pruebas existentes

- [x] 6.1 Actualizar `tests/browser.test.mjs` para que busque el título del dashboard en lugar de `/^Hola/` y conservar las comprobaciones de roles y conteo de entradas. Verificación: `npm run test:e2e` pasa sin referencias al saludo.
- [x] 6.2 Actualizar el README: URL de producción `https://auto-servicio.vercel.app/`, descripción de `/dashboard`, origen y formato de los JSON, cómo reemplazarlos, y que la actualización semanal automática queda para un cambio posterior. Actualizar `AGENTS.md` y `CLAUDE.md` donde `/dashboard` se describa como saludo. Verificación: cada comando y ruta documentados existen y se ejecutan como están escritos.

## 7. Verificación integral

- [ ] 7.1 Ejecutar `npm run lint`, `npm run build`, `npm test` y `npm run test:e2e` con Node.js 26.13.1 y registrar los resultados y limitaciones. Verificación: todos terminan sin errores. PENDIENTE: lint, build, `npm test` (29 pruebas) y `npm run test:e2e` pasan, pero se ejecutaron con Node.js 24.14.1 porque la máquina no tiene Node 26.13.1 ni nvm; repetir con 26.13.1.
- [x] 7.2 Ejecutar `npm run openspec -- validate --all --strict`. Verificación: sin errores ni advertencias.
- [ ] 7.3 Revisión manual en local con una cuenta Usuario y una Administrador, comparando las 6 pestañas con el artefacto con y sin filtros, y confirmar que una cuenta Pendiente no recibe datos. Verificación: lista de diferencias, si existen, resueltas o registradas. PENDIENTE: las pruebas de navegador cubren roles, filtros, pestañas, mapa y 320 px con cuentas sintéticas; falta la comparación visual con el artefacto y la prueba con Google real.

## Workflow follow-up

- No hacer push ni despliegue como parte de implementar; la publicación se pide aparte.
- Archivar el cambio cuando se cumplan los requisitos de revisión del proyecto y verificar el resultado archivado.
- Cambio posterior sugerido: automatizar la generación de los JSON desde los Excel o Drive.
