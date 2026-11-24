# Claude Code

Leer y aplicar las instrucciones compartidas del proyecto:

@AGENTS.md

Trabajar directamente en `master`, sin crear ramas salvo solicitud explicita.
Usar Node.js 26.x y App Router: login Google en `/`, dashboard protegido en `/dashboard`,
acceso pendiente en `/pending` y administracion en `/users` y `/users/activity`.
`backend/` contiene Better Auth y MongoDB server-only; Express y Mongoose permanecen inactivos.
Las skills OpenSpec estan en `.claude/skills/`; especificaciones y cambios en
`openspec/`. Ejecutar `npm run openspec -- <argumentos>` para la version fijada.

MCP del proyecto: `.mcp.json`. Preparar con `npm run mcp:setup`; usar Context7,
Playwright y MongoDB en solo lectura segun la tarea. Consultar README para requisitos y credenciales.

Catalogo: 13 skills (6 OpenSpec + 7 oficiales Vercel/MongoDB); verificar con `npm run skills:check`.
