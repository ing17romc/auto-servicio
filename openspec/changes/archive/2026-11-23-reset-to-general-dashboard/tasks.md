# Tasks

## 1. Punto de partida y runtime

- [x] 1.1 Crear una rama `codex/reset-to-general-dashboard`, registrar el commit base y comprobar que los cambios ajenos se preservan; verificar con `git status` y `git remote -v` que el historial y remoto siguen intactos.
- [x] 1.2 Seleccionar Node.js 26.x para los comandos del proyecto y añadir `engines.node` y `.nvmrc`; verificar `node --version` en la misma sesión que ejecutará npm, sin cambiar innecesariamente otros proyectos de la máquina.
- [x] 1.3 Renovar `package.json` y regenerar `package-lock.json` con Next.js 16.4.6 y React/React DOM 19.3.1, o los parches estables compatibles comprobados al implementar; retirar todas las dependencias heredadas, conservar OpenSpec y configurar ESLint mínimo compatible. Verificar las versiones instaladas y registrar cualquier ajuste respecto al diseño.
- [x] 1.4 Añadir scripts `dev`, `build`, `start` y `lint`, y documentar requisitos y comandos en README; verificar instalación limpia con `npm ci` bajo Node.js 26.x.

## 2. Pantalla nueva y retiro del código heredado

- [x] 2.1 Reemplazar desde cero el frontend por `pages/index.js` con un único `h1` cuyo texto sea `General Dashboard`; retirar `_app.js` personalizado y todas las demás rutas antiguas. Verificar que `pages/` contiene una sola pantalla de producto, que `/` responde 200 en desarrollo y que lint pasa.
- [x] 2.2 Eliminar `pages/api/`, todo el código de `backend/`, componentes, estilos, utilidades y configuración de negocio de las carpetas auxiliares, además de `initAuth.js` e `install.sh`; conservar las carpetas superiores acordadas con `.gitkeep`. Verificar que el backend no contiene archivos ejecutables ni quedan imports a código eliminado.
- [x] 2.3 Comprobar en navegador que solo se ve `General Dashboard`, con un único encabezado semántico y sin desbordamiento a 320 píxeles ni en escritorio; revisar consola y red para confirmar ausencia de errores y llamadas a Firebase/MySQL/MongoDB.
- [x] 2.4 Documentar en README la única URL `/`, la retirada de las APIs y que MongoDB se integrará en otra etapa; verificar coherencia con `specs/general-dashboard/spec.md` y ausencia de instrucciones de arranque antiguas.

## 3. Entorno y contexto compartido

- [x] 3.1 Retirar `.env.local` del árbol versionado y eliminar la configuración heredada usada por esta base, sin imprimir sus valores; añadir reglas `.env*`, excepción `.env.example` y `.vercel/` a `.gitignore`. Verificar que `git ls-files` no incluirá archivos de entorno reales en el commit resultante y que `.env.example` seguirá versionable.
- [x] 3.2 Crear `.env.example` sin credenciales ni variables obligatorias y documentar que no se requiere ninguna base disponible; verificar que dev y build funcionan sin archivos de entorno reales y que no se instala un driver MongoDB innecesario.
- [x] 3.3 Actualizar `AGENTS.md`, `CLAUDE.md` y `openspec/config.yaml` a la nueva base, conservando skills e historial OpenSpec; verificar que describen backend vacío, una pantalla y MongoDB futuro, sin Firebase o MySQL activos, y ejecutar validación estricta del cambio.

## 4. Verificación integrada y entrega local

- [x] 4.1 Ejecutar `npm run lint`, `npm run build` y `npm start` con Node.js 26.x sin credenciales externas; comprobar `/` en producción, la versión real del runtime y que no hay secretos en HTML ni recursos públicos. Registrar resultados y comandos.
- [x] 4.2 Revisar el manifiesto de rutas del build y comprobar HTTP 404 para cada patrón heredado del inventario de `design.md`, sustituyendo `[id]` por un valor de prueba; verificar también GET/POST/PUT/DELETE/PATCH en las rutas API eliminadas, con cero endpoints de negocio propios.
- [x] 4.3 Si hay acceso autorizado a Vercel, consultar el proyecto existente en modo de solo lectura y registrar preset Next.js, raíz, comandos y compatibilidad con Node.js 26.x; si no hay acceso, registrar explícitamente la comprobación remota pendiente antes de publicar. No crear proyecto, hacer push ni desplegar como parte de esta tarea.
- [x] 4.4 Revisar el diff contra el playbook, ejecutar `git diff --check` y `npm run openspec -- validate reset-to-general-dashboard --strict`, y entregar archivos cambiados, validaciones y limitaciones; comprobar que no se modificaron datos externos ni el remoto GitHub.

## Workflow follow-up

- Tras la revisión y aceptación de la implementación, sincronizar y archivar el cambio con OpenSpec cuando se solicite.
- La publicación y cualquier modificación de ajustes remotos de Vercel se realizarán mediante una solicitud posterior.
