# Design

## Context

`app/dashboard/page.js` es un Server Component que llama a `pageIdentity(['user', 'admin'])`. Esa función devuelve `{ principal, role, name }`, donde `name` procede de `result.user.name` de la sesión de Better Auth (backend/auth/server.mjs). El encabezado actual es un literal.

## Decisions

- **Fuente del nombre**: usar `identity.name` ya disponible en la página; no se añaden consultas a MongoDB ni llamadas nuevas.
- **Formato**: `Hola, {nombre}` con coma. Si `identity.name` está vacío o ausente, renderizar `Hola`.
- **Escapado**: React escapa el texto automáticamente; no se usa `dangerouslySetInnerHTML`.
- **Título del documento**: se mantiene `General Dashboard` para no alterar metadatos ni el requisito de título en `application-runtime`.
- **Orden de cambios**: el cambio depende de `add-social-auth-and-user-access`, cuyos requisitos del dashboard aún no están archivados. Aplicar y archivar primero ese cambio.

## Risks

- Un nombre muy largo puede desbordar el encabezado en móvil; se verifica con viewport de 320 px.
- Un nombre con datos sensibles no es un riesgo nuevo, pero la respuesta sigue siendo HTML de la sesión autenticada.

## Out of scope

- Cambios en backend, autenticación, roles, `proxy.js` o base de datos.
- Cambio del título del documento o de la navegación.
