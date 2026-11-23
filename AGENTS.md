# Instrucciones del proyecto

- Antes de analizar o modificar codigo, leer el playbook personal si existe:
  `C:\Users\ing_r\iCloudDrive\AI-Coding-Standards\PLAYBOOK.md`.
  Si no existe en otra maquina, aplicar las convenciones del repositorio e informar la limitacion.
- Trabajar siempre directamente en `master`. No crear ramas nuevas salvo solicitud explicita del usuario.
- Mantener cambios acotados, proteger secretos y validar segun el alcance.
- Runtime: Node.js 26.x; seleccionar la version de `.nvmrc` antes de ejecutar npm.
- Frontend: Next.js Pages Router, una sola pantalla en `pages/index.js`, ruta `/`,
  cuyo unico contenido visible es `General Dashboard`.
- `backend/` y las carpetas auxiliares estan vacias y reservadas. No hay endpoints,
  autenticacion ni conexiones a bases de datos. MongoDB se integrara en otra etapa.
- No reutilizar ni restaurar logica, dependencias o configuracion heredadas.
- Usar las skills `openspec-*` para los cambios solicitados mediante ese flujo.
  Ejecutar el CLI como `npm run openspec -- <argumentos>` (version 2.1.1).
- Verificar con `npm run lint`, `npm run build` y las comprobaciones apropiadas al cambio.
- Nunca versionar archivos de entorno reales ni imprimir sus valores; usar `.env.example` sin secretos.
- Conservar el remoto GitHub, historial y destino Vercel existentes. No publicar sin solicitud.
- Al finalizar, revisar contra el playbook y resumir cambios, verificaciones y limitaciones.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
