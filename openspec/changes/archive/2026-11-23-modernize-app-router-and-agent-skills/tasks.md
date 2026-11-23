# Tasks

## 1. Skills oficiales

- [x] 1.1 Instalar las siete skills desde los commits oficiales del diseño, conservar recursos/licencias y registrar fuente, commit y ruta en tools/skills-sources.json; verificar que cada skill tiene SKILL.md y que se revisaron sus instrucciones y scripts sin ejecutarlos.
- [x] 1.2 Copiar las siete skills completas a .claude/skills y comprobar hashes y catálogo: deben existir 13 skills equivalentes por cliente, incluidas las seis OpenSpec existentes.

## 2. Aplicación y dependencias

- [x] 2.1 Migrar a app/page.js y app/layout.js con metadata e idioma inglés, retirar pages y mantener backend vacío; verificar una sola ruta de producto y encabezado presente en HTML sin JavaScript.
- [x] 2.2 Instalar Express 5.3.0 y Mongoose 9.13.0 con lockfile actualizado; verificar imports locales, estado desconectado de Mongoose y ausencia de listen/connect en el código de aplicación.
- [x] 2.3 Actualizar README, AGENTS.md, CLAUDE.md y contexto OpenSpec para App Router, skills y dependencias futuras; verificar coherencia y registrar que no se creó ningún servidor o conexión ni se modificaron MCP.

## 3. Validación integrada

- [x] 3.1 Ejecutar npm ci, npm run lint y npm run build con Node.js 26.x y sin variables de datos; verificar que los comandos terminan correctamente y el manifiesto usa App Router.
- [x] 3.2 Comprobar producción y desarrollo, navegador móvil/escritorio y JavaScript deshabilitado; verificar contenido/título exactos, idioma, cero errores y llamadas externas, rutas retiradas 404 y ausencia de Express/Mongoose en recursos cliente.
- [x] 3.3 Revisar diff contra el playbook, equivalencia final de skills y procedencia, ejecutar validación OpenSpec estricta y git diff --check; registrar resultados y limitaciones antes de archivar.

## Workflow follow-up

- Sincronizar los deltas y archivar este cambio tras completar las tareas, como solicitó el usuario.
- No desplegar ni modificar recursos externos durante este trabajo.
