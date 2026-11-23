# Proposal

## Why

El proyecto recién reiniciado necesita una base moderna para futuras funcionalidades y guías oficiales reutilizables entre Claude Code y Codex. App Router habilita el modelo actual de componentes de servidor, mientras Express y Mongoose deben quedar disponibles sin anticipar funcionalidades de backend.

## What Changes

- Migrar la única pantalla `/` a App Router con layout raíz y metadatos, preservando exactamente `General Dashboard` como contenido visible.
- Instalar Express 5.3.0 y Mongoose 9.13.0, versiones estables compatibles con Node.js 26.x, sin servidor personalizado, endpoints, modelos ni conexión MongoDB.
- Instalar siete skills oficiales de Vercel y MongoDB en el repositorio para ambos asistentes, conservando las seis skills OpenSpec y los MCP existentes.
- Registrar el origen y commit de cada skill, incluir sus recursos y licencias y documentar su uso y límites.
- Actualizar instrucciones, README y el contrato del runtime que antes excluía drivers de MongoDB.

## Capabilities

### New Capabilities

- `agent-skills`: disponibilidad portable de siete skills oficiales, trazabilidad y paridad entre Claude Code y Codex.

### Modified Capabilities

- `application-runtime`: permitir dependencias Express/Mongoose inactivas y asegurar que la pantalla se renderiza sin servicios externos ni código de backend en el navegador.

## Impact

Afecta `app/`, `pages/`, manifiesto y lockfile, instrucciones compartidas y directorios de skills. La URL, el título visible y la separación de `backend/` se conservan. No cambian las credenciales ni los MCP. No se crea otro proyecto GitHub/Vercel ni se despliega manualmente.

Aceptación: instalación limpia, lint y build con Node.js 26; una sola pantalla pública; cero conexiones o APIs nuevas; importación local de Express/Mongoose sin servicios; siete skills nuevas completas y equivalentes en ambos clientes; validación OpenSpec y archivo sin tareas pendientes.
