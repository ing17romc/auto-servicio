# Design

## Context

Ver proposal.md para motivación. Hoy existe una sola página con `next/head`, sin backend ejecutable. La spec principal `application-runtime` excluye drivers de datos; debe modificarse explícitamente para permitir Mongoose. Hay seis skills OpenSpec y tres MCP compartidos. El usuario autorizó expresamente encadenar explore, propuesta, implementación y archivo en esta solicitud, trabajando en master.

## Goals / Non-Goals

**Goals:** conservar la única pantalla, modernizar su router e instalar guías oficiales portables y dependencias futuras con versiones fijas.

**Non-Goals:** construir una API, un custom server de Next.js, autenticación, modelos, conexión MongoDB, migraciones de datos o despliegue manual. No se cambian Node, Next, React ni los MCP.

## Decisions

1. App Router: sustituir `pages/index.js` por `app/page.js` como Server Component y `app/layout.js` con `<html lang="en">`, `<body>` y metadata estática (título e icono de datos vacío). Evitar `use client`, next/head y dependencias nuevas de UI. Eliminar la carpeta pages vacía. `backend/` y auxiliares siguen reservados.
2. Express 5.3.0 y Mongoose 9.13.0 como dependencias directas exactas en el manifiesto y lockfile; ambas admiten Node 26. No crear funciones listen/connect ni importar esas librerías desde `app/`. La petición expresa del usuario justifica estas dependencias anticipadas frente a la regla general de añadir solo lo necesario hoy.
3. Usar el instalador de skills con `--dest .agents/skills` y commits inmutables; copiar directorios completos a `.claude/skills` para que Windows, Git y otra máquina no dependan de symlinks. Mantener los nombres internos oficiales y todos sus recursos. Conservar las seis skills OpenSpec sin reemplazarlas.
4. Fuentes fijadas al explorar: Vercel `vercel-labs/agent-skills` commit `5a37a6329fbad3666c3207392a6a7c0110e92efb`; MongoDB `mongodb/agent-skills` commit `180d6a3386c1d1dc44cdab300cc0f7ed0843c9e0`. Skills: vercel-react-best-practices (ruta skills/react-best-practices), web-design-guidelines, deploy-to-vercel, mongodb-schema-design, mongodb-query-optimizer, mongodb-natural-language-querying y mongodb-connection. Las demás rutas son skills/<nombre>. Registrar fuentes en `tools/skills-sources.json` y conservar licencias de cada repositorio junto a la skill.
5. Documentar que las skills guían el trabajo y pueden exigir credenciales o servicios para operaciones concretas. MongoDB MCP sigue siendo solo lectura. El despliegue debe reutilizar el proyecto Vercel existente y requerir solicitud explícita, incluso si una skill ofrece crear otro proyecto.
6. Actualizar README, AGENTS, CLAUDE y contexto OpenSpec para App Router, dependencias dormidas y catálogo de 13 skills. Mantener el historial de cambios previos como registro histórico.

## Risks / Trade-offs

- [Una spec antigua prohíbe drivers] -> Modificar su requisito completo y sincronizarlo antes del archivo, sin borrar sus otros contratos.
- [Skills descargadas pueden cambiar de nombre o traer scripts] -> Descargar desde commits oficiales fijos, revisar instrucciones y scripts sin ejecutarlos, conservar recursos y registrar procedencia.
- [Copias duplicadas pueden divergir] -> Comparar contenido y hashes de todos los archivos entre los dos clientes antes de cerrar.
- [Dependencias sin uso aumentan instalación] -> Es una decisión explícita del usuario; no añadir adaptadores, modelos ni servidor hasta que exista funcionalidad que los use.
- [Servidores y drivers podrían terminar en el bundle cliente] -> Mantenerlos fuera del grafo app y comprobar los recursos generados.

## Migration Plan

Validar artefactos, instalar skills, migrar página/layout, instalar dependencias, actualizar documentación y ejecutar instalación limpia, lint, build, HTTP y navegador con Node 26. Validar imports sin conexión; revisar paridad y procedencia de skills. Sincronizar las dos specs y archivar cuando todas las tareas estén completas. Revertir archivos y lockfile mediante Git si se necesita rollback; no hay datos que revertir.

## Exploration Evidence

- Documentación local: `next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` y `04-functions/generate-metadata.md`.
- Context7 consultado para Next.js, Express y Mongoose; la consulta Next.js falló y se usó la documentación de la versión instalada. Express separa crear la aplicación de listen; Mongoose conecta mediante una llamada explícita a connect.
- Registro npm: Express 5.3.0 (Node >=18), Mongoose 9.13.0 (Node >=20.19).
- No hay decisiones funcionales pendientes. No se ejecutarán scripts de despliegue de las skills durante su instalación.
