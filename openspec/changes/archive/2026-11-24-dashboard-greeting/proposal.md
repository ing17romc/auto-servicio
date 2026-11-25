# Proposal

## Why

La pantalla autorizada del dashboard muestra siempre el mismo encabezado genérico, `General Dashboard`, sin identificar a la persona que ha iniciado sesión. Se quiere un saludo personalizado que muestre el nombre de la cuenta Google autenticada.

## What Changes

- El encabezado de nivel uno de `/dashboard` pasa de `General Dashboard` a `Hola, {nombre}`, donde `{nombre}` es el nombre de la cuenta Google de la sesión actual.
- Si la sesión no aporta un nombre utilizable, el encabezado muestra únicamente `Hola`.
- El título del documento (`General Dashboard`) no cambia; solo cambia el texto visible.
- Las pruebas que buscan el encabezado `General Dashboard` se actualizan al nuevo texto.
- **BREAKING** (interfaz): el texto visible de `/dashboard` deja de ser `General Dashboard`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `general-dashboard`: el requisito de pantalla autorizada pasa a mostrar el saludo `Hola, {nombre}` en lugar del encabezado `General Dashboard`.
- `application-runtime`: el requisito de renderizado inicial pasa a exigir el saludo en el HTML inicial.

## Impact

- `app/dashboard/page.js`: sustituye el texto del `<h1>` por el saludo, usando `identity.name` ya devuelto por `pageIdentity`.
- `tests/browser.test.mjs` (línea ~195): la comprobación del encabezado pasa a buscar el saludo.
- Dependencia: los deltas de este cambio modifican requisitos que el cambio activo `add-social-auth-and-user-access` aún no ha archivado. Este cambio debe aplicarse y archivarse después de ese.
- Sin cambios en backend, base de datos, dependencias ni variables de entorno.
