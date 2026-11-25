## Why

El dashboard de negocio "Dashboard General Autoservicios · Cero Humedad" (corte semana 46) vive hoy solo en un artefacto privado de Claude, que depende de su runtime `dash` y no puede incrustarse ni compartirse con los usuarios del portal. La página protegida `/dashboard` solo muestra el saludo `Hola, {nombre}`. Se necesita ver ese mismo dashboard, exactamente como está en el artefacto, dentro del portal y detrás de su control de acceso por rol.

## What Changes

- Reemplazar el contenido de `/dashboard` (el saludo) por una réplica fiel del artefacto: encabezado con logotipo y frase de resumen, filtros de Cadena, Estado y Artículo RAC con chips de logotipos y "Quitar filtros", y las 6 pestañas (Resumen ejecutivo, Mapa y estados, Productos, Inventarios, Alertas, Accionables) con sus indicadores, tablas, mapas de calor, gráficas de línea con tendencia, mapa de México y listas de alertas y acciones.
- Portar a código del proyecto la lógica de cálculo del artefacto (`kpi`, `ocho`, `por_cadena`, `por_estado`, `por_articulo`, `heat`, `serie`, `inv_serie`, `alertas`, tops, `pedido`, `acciones`, `destacados`) sin depender del runtime `dash`.
- Incorporar los 4 conjuntos de datos del artefacto como archivos JSON del servidor (venta e inventario semanal, venta por tienda y artículo, coordenadas de tiendas, presencia de Sam's), la geometría de estados y los 5 logotipos. Sin MongoDB.
- Servir los datos solo mediante un endpoint protegido que valide sesión y rol `user` o `admin` en cada petición; los datos nunca se publican como archivos estáticos.
- Agregar `d3` como dependencia de gráficas y mapa.
- Documentar en el README la URL de producción `https://auto-servicio.vercel.app/` y el origen y la forma de reemplazar los JSON.
- Fuera de alcance: automatizar la lectura de Excel o Google Drive y la actualización semanal (cambio posterior), reglas de negocio nuevas, cambios de roles o de autenticación, y publicar o desplegar.

## Capabilities

### New Capabilities
- `sales-inventory-dashboard`: contenido, filtros, pestañas, cálculos, datos y protección de acceso del dashboard de venta e inventario por cadena, estado y artículo en `/dashboard`.

### Modified Capabilities
- `general-dashboard`: `/dashboard` deja de ser una pantalla con solo el saludo; el contenido principal pasa a ser el dashboard de venta e inventario, y se ajusta la presentación mínima accesible.
- `application-runtime`: el HTML inicial de `/dashboard` ya no entrega el saludo sino el título y la estructura del dashboard, y los datos de venta provienen de archivos del servidor y no de MongoDB.

## Impact

- Código: `app/dashboard/page.js`, nuevos componentes cliente en `components/`, módulo de cálculos y carga de datos en `backend/`, nuevo endpoint bajo `app/api/`, estilos del dashboard en `app/`.
- Datos y activos: JSON privados en el servidor (no en `public/`), ~2.7 MB entre los 4 conjuntos de datos y la geometría; 5 logotipos.
- Dependencias: `d3` (nueva).
- Seguridad: el endpoint de datos debe verificar sesión y rol por sí mismo, porque `proxy.js` hoy solo cubre `/dashboard`, `/pending` y `/users`.
- Analítica de accesos: la entrada a `/dashboard` sigue contando por navegación de documento; las peticiones de datos no cuentan como entradas.
- Documentación: README (URL de producción, datos y roles de `/dashboard`) y `AGENTS.md`/`CLAUDE.md` si describen `/dashboard` como saludo.
- Criterio de aceptación: con una cuenta Usuario o Administrador, `/dashboard` muestra el mismo contenido y las mismas cifras que el artefacto con los filtros sin aplicar (por ejemplo, venta acumulada 2026 S1–S46); sin sesión o con rol Pendiente no se entregan datos.
