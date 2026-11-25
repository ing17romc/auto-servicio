# Instrucciones del proyecto

- Antes de analizar o modificar codigo, leer el playbook personal si existe:
  `C:\Users\ing_r\iCloudDrive\AI-Coding-Standards\PLAYBOOK.md`.
  Si no existe en otra maquina, aplicar las convenciones del repositorio e informar la limitacion.
- Trabajar siempre directamente en `master`. No crear ramas nuevas salvo solicitud explicita del usuario.
- Mantener cambios acotados, proteger secretos y validar segun el alcance.
- Runtime: Node.js 26.x; seleccionar la version de `.nvmrc` antes de ejecutar npm.
- Frontend: Next.js App Router; `/` login Google, `/pending` acceso pendiente,
  `/dashboard` dashboard de venta e inventario (datos en JSON del servidor, endpoint
  protegido `/api/dashboard/data`), `/users` y `/users/activity` solo administradores.
  Producción: https://auto-servicio.vercel.app/.
- `backend/` contiene autenticacion Better Auth, permisos y persistencia MongoDB server-only.
  Express y Mongoose permanecen instalados e inactivos; no iniciar otro servidor.
- Roles: pending/user/admin; comprobar sesion y rol actual en cada operacion protegida.
  Los cambios de rol y el primer administrador requieren las transacciones definidas.
- Navegacion a dashboard con carga de documento; no usar prefetch ni conteo con useEffect.
  `proxy.js` autoriza y registra una entrada por documento antes de renderizar.
- Build sin credenciales; operacion autenticada requiere Google y una base nueva MongoDB
  con replica set. No conectar durante importacion/build ni usar bases heredadas.
- Pruebas: `npm test` y `npm run test:e2e` (requiere build y Chrome); crean replica sets
  temporales aislados. Nunca apuntarlas a una base real ni añadir bypass OAuth en produccion.
- MCP compartidos: Context7 para documentacion, Playwright para navegador y MongoDB en solo lectura.
- Configuraciones: `.mcp.json` (Claude Code), `.codex/config.toml` (Codex). Preparar con `npm run mcp:setup`.
- Los MCP viven en `tools/mcp/`, separados del backend. Sus credenciales son variables de entorno del asistente; no imprimirlas.
- Skills: seis OpenSpec y siete oficiales Vercel/MongoDB en ambos clientes; fuentes en `tools/skills-sources.json`.
- Ejecutar `npm run skills:check` al modificar el catalogo. No editar copias oficiales sin actualizar procedencia y hashes.
- App Router usa Server Components por defecto; no importar Express o Mongoose en componentes cliente.
- La skill de despliegue debe reutilizar Vercel existente; instalarla no autoriza publicar.
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
