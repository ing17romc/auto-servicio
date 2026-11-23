# Design

## Context

Ver `proposal.md` para la motivación. La raíz y `_app.js` actuales dependen de Firebase, `edt-lib` y componentes compartidos; las rutas API llaman a MySQL y MongoDB. Una sustitución aislada de la página no elimina esas dependencias globales. No existen specs principales ni scripts de build o validación estática.

Se requiere diseño por el alcance transversal, la eliminación de integraciones y la actualización mayor del runtime. La conexión remota de Vercel no tiene metadatos locales verificables; no se debe afirmar que un build local prueba un despliegue remoto.

## Goals / Non-Goals

**Goals:**
- Reconstruir únicamente el código mínimo necesario para satisfacer las dos especificaciones, conservando la organización del repositorio.
- Separar la disponibilidad de la pantalla de cualquier integración futura con MongoDB.
- Tener comandos reproducibles y verificaciones que detecten rutas o dependencias heredadas residuales.

**Non-Goals:**
- Introducir App Router, TypeScript, monorepo, servidor Express, autenticación o herramientas de diseño.
- Modificar cuentas externas, datos, permisos, dominios o publicar el cambio.
- Reescribir el historial de Git para eliminar secretos anteriores.

## Decisions

### 1. Pages Router y carpetas existentes

Crear de cero `pages/index.js` para `/`. El nombre de la pantalla será `General Dashboard`; no crear una ruta adicional `/general-dashboard` ni redirecciones. No hace falta conservar `_app.js`: se usará el contenedor predeterminado de Next.js, salvo que una necesidad mínima de configuración lo justifique.

Conservar vacías las carpetas de organización superiores `backend/`, `components/`, `config/`, `constants/`, `content/`, `context/` y `lib/`, usando `.gitkeep`. Eliminar subárboles de dominios antiguos, `pages/api/`, rutas auxiliares y todos los archivos de negocio. Eliminar `initAuth.js` e `install.sh` heredados. Conservar o renovar solo la configuración mínima utilizada.

Alternativa: migrar a App Router o crear carpetas nuevas frontend/backend. Se descarta porque el usuario quiere mantener la estructura y no hay comportamiento que requiera esa migración.

### 2. Dependencias mínimas y versiones explícitas

Usar Node.js `26.x` en `engines.node` y un archivo de selección local `.nvmrc`; comprobar `node --version` antes de validar. No instalar Node.js como dependencia de la aplicación ni cambiar la instalación global de la máquina sin necesidad: puede usarse un runtime aislado para validar.

Versiones estables consultadas al planificar: Next.js `16.4.6`, React y React DOM `19.3.1`. Fijarlas en el manifiesto y regenerar el lockfile con el runtime objetivo; revisar compatibilidad y actualizaciones estables de seguridad al implementar, dejando constancia si cambia una versión puntual. Evitar rangos abiertos que cambien la instalación sin revisión.

Mantener como dependencias de ejecución solo Next.js, React y React DOM. Renovar ESLint y su configuración para la versión seleccionada de Next.js, con un comando `lint` directo de ESLint; no usar `next lint`. No agregar Sass, UI kits, router externo, gráficos, ODM o driver de datos.

Conservar el comando OpenSpec fijado a 2.1.1. Scripts objetivo: `dev`, `build`, `start`, `lint` y `openspec`. Se elige lint más build y comprobaciones HTTP proporcionales, en lugar de incorporar un framework de tests para una etiqueta estática.

### 3. Backend vacío y MongoDB diferido

Retirar también la implementación antigua de MongoDB. Documentar MongoDB como tecnología elegida para el siguiente trabajo de datos; no crear endpoint de salud, cliente, colección, modelo ni índice ahora. Así el dashboard compila sin `MONGODB_URI` y no necesita recuperar el clúster anterior para terminar esta etapa.

Alternativa: conservar Mongoose o añadir un nuevo cliente inmediatamente. Se descarta porque no existe funcionalidad que use datos y contradiría la limpieza del backend.

### 4. Entorno y documentación

Retirar `.env.local` del árbol versionado y quitar la configuración heredada del entorno usado por esta base. Crear `.env.example` sin valores reales, indicando que no hay variables obligatorias y reservando MongoDB para una etapa posterior. Ignorar `.env*` excepto `.env.example` y `.vercel/`.

Actualizar `AGENTS.md`, `CLAUDE.md` y `openspec/config.yaml` para que dejen de describir Firebase/MySQL como parte activa del producto. Añadir instrucciones mínimas de instalación y arranque en README. Mantener skills e historial OpenSpec.

### 5. Verificación de rutas y continuidad

Guardar en los artefactos de este cambio el inventario de rutas retiradas, para poder verificar 404 tras eliminar sus archivos. Las rutas internas de Next.js (por ejemplo recursos de `/_next/`) y su página de error no cuentan como pantallas propias del producto.

La configuración estándar de Next.js en la raíz basta para el build; no inventar IDs, tokens ni archivos de enlace de Vercel. Consultar de forma de solo lectura, si hay acceso, el proyecto existente para revisar preset Next.js, raíz del repositorio y comandos personalizados. Sin acceso, registrar esa verificación remota como pendiente antes de publicar, sin bloquear la validación local.

## Risks / Trade-offs

- [Se eliminan todas las funciones actuales y sus URLs] -> Inventariar rutas, conservar el historial y ejecutar el cambio en una rama para revisión antes de publicarlo.
- [Un push a la rama conectada puede disparar un despliegue] -> Esta etapa no hace push ni deploy; la publicación requiere una solicitud posterior.
- [Node.js local aún es 24.14.1] -> Validar explícitamente con Node.js 26.x y documentar cómo seleccionar esa versión localmente.
- [La configuración remota antigua de Vercel puede sobrescribir comandos o raíz] -> Revisar ajustes existentes antes de publicar; no crear otro proyecto como solución automática.
- [El historial contiene un archivo de entorno] -> Excluirlo del árbol vigente y no reproducir sus valores. Limpiar el árbol no revoca secretos ni elimina commits anteriores.
- [No habrá conexión MongoDB operativa al terminar] -> Es una decisión de alcance: el siguiente cambio de datos debe configurar una conexión nueva y comprobar disponibilidad.

## Migration Plan

1. Crear una rama de trabajo y verificar el punto de partida, sin alterar el remoto ni reescribir commits.
2. Renovar runtime, manifiesto, configuración mínima y lockfile; reconstruir la pantalla; vaciar backend y carpetas auxiliares retirando todo el código anterior.
3. Retirar configuración de servicios y documentar el estado nuevo; actualizar contexto OpenSpec e instrucciones.
4. Ejecutar instalación limpia, lint y build con Node.js 26.x, y revisar el manifiesto de rutas y respuestas HTTP de producción.
5. Entregar resultados y diferencias para revisión. Un despliegue futuro reutilizará el proyecto Vercel existente tras verificar sus ajustes.

Rollback: revertir el commit de implementación mediante un commit nuevo. No restaurar automáticamente archivos con credenciales ni desplegar el estado anterior; si se necesita recuperar una integración, configurar secretos por un canal local/no versionado. No hay migraciones de datos que revertir.

## Open Questions

- Identificador y ajustes actuales del proyecto Vercel: pueden verificarse antes de una publicación futura, sin cambiar los requisitos ni el diseño local.

## References

- Vercel, versiones de Node.js: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions (consultado al planificar; admite 26.x).
- Next.js, versión estable: https://github.com/vercel/next.js/releases/tag/v16.4.6.
- Registro npm: `npm view next@latest version engines --json` y `npm view react@latest version --json`.

## Legacy Route Inventory

Patrones obtenidos del árbol vigente antes de la implementación. Reemplazar `[id]` por un identificador de prueba al verificar HTTP. `_app.js` es infraestructura y no una ruta.

- `/Auth/Login`
- `/Auth/Register`
- `/Auth/User`
- `/api/cero-humedad/productos/[id]`
- `/api/cero-humedad/productos`
- `/api/login`
- `/api/logout`
- `/api/walmart/productos/[id]`
- `/api/walmart/productos`
- `/api/walmart/registros-eventos`
- `/api/walmart/tabular/anio-semana`
- `/api/walmart/tabular/graficas`
- `/api/walmart/tabular`
- `/api/walmart/tiendas`
- `/api/walmart/tipos-tiendas/[id]`
- `/api/walmart/tipos-tiendas`
- `/cero-humedad`
- `/cero-humedad/productos/[id]`
- `/cero-humedad/productos/crear`
- `/cero-humedad/productos`
- `/walmart/components/Totales`
- `/walmart/graficas/graficas`
- `/walmart/graficas`
- `/walmart`
- `/walmart/productos/[id]`
- `/walmart/productos/components/ComponentEdit`
- `/walmart/productos/crear`
- `/walmart/productos`
- `/walmart/registros-eventos`
- `/walmart/tabular`
- `/walmart/tiendas`
- `/walmart/tipos-tiendas/[id]`
- `/walmart/tipos-tiendas/crear`
- `/walmart/tipos-tiendas`
