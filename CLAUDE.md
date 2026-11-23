# Claude Code

Leer y aplicar las instrucciones compartidas del proyecto:

@AGENTS.md

Trabajar directamente en `master`, sin crear ramas salvo solicitud explicita.
Usar Node.js 26.x. El frontend contiene solo `General Dashboard` en `/`;
`backend/` esta reservado y vacio. MongoDB es una integracion futura.
Las skills OpenSpec estan en `.claude/skills/`; especificaciones y cambios en
`openspec/`. Ejecutar `npm run openspec -- <argumentos>` para la version fijada.

MCP del proyecto: `.mcp.json`. Preparar con `npm run mcp:setup`; usar Context7,
Playwright y MongoDB en solo lectura segun la tarea. Consultar README para requisitos y credenciales.
