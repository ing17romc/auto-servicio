# Design

## Context

Ver proposal.md para motivación. El árbol observado está limpio en master, con app/page.js (un h1), app/layout.js, Next.js 16.4.6, React 19.3.1 y Node 26.13.1. No hay autenticación, modelos, pruebas de aplicación ni conexión activa. Las specs vigentes exigen dashboard público, documento inglés y ausencia de servicios: los deltas sustituyen explícitamente esos contratos. Esta etapa solo crea planificación; no comprueba credenciales ni servicios remotos.

Se consultó la guía local node_modules/next/dist/docs/01-app/02-guides/authentication.md y documentación oficial de Better Auth mediante Context7. El modelo se apoya en mongodb-schema-design: perfiles acotados, eventos separados y retención explícita. Los patrones de consulta provienen de los requisitos del usuario, no de una base de producción inspeccionada.

## Goals / Non-Goals

**Goals:** separar autenticación, autorización y medición; mantener el despliegue Next.js existente; hacer comprobables los permisos, la concurrencia de roles y el conteo.

**Non-Goals:** contraseñas, invitaciones por correo, Microsoft activo, vinculación de cuentas, eliminación de usuarios, negocio del dashboard, servidor Express, publicación o restauración de datos heredados.

## Decisions

### Autenticación y dependencias

Proponer Better Auth con adaptador oficial MongoDB y driver mongodb declarado directamente. Sus integraciones documentadas cubren Next.js, Google, sesiones de base de datos y Microsoft futuro. Fijar una versión estable y sus dependencias compatibles al implementar, tras revisar avisos de seguridad y ejecutar pruebas con Node 26 y Next 16; no declarar compatibilidad validada en esta propuesta.

Auth.js es una alternativa viable; Better Auth se elige por sus flujos de sesión y cuentas documentados en una integración cohesiva. Un servicio gestionado agrega cuenta externa, coste y dependencia operativa; OAuth casero aumenta superficie de seguridad. Mongoose instalado no se activa: el adaptador usa el driver oficial y evita dos capas de modelado para las mismas colecciones. Express permanece reservado.

Auth y acceso a datos viven en backend/auth y backend/db con server-only. Route Handler en app/api/auth/[...all]/route.js. Conexión diferida al primer uso, reutilizada por proceso, con límites de pool y tiempos finitos definidos al aplicar la skill mongodb-connection. No conectar durante importación/build; no exponer URI al navegador.

Google: cliente OAuth web, consentimiento y usuarios de prueba cuando aplique; callbacks registrados exactamente como http://localhost:3000/api/auth/callback/google y el origen productivo real con el mismo path. Solicitar únicamente identidad básica (openid, profile, email), sin acceso a Drive o Gmail, ni refresh tokens si no son necesarios. Deshabilitar vinculación automática y registro por contraseña. No persistir tokens de proveedor innecesarios; comprobar las opciones de la versión fijada y evitar registrarlos en logs.

Microsoft es técnicamente posible mediante Entra ID, registro de aplicación, credencial y callback /api/auth/callback/microsoft. Exige decidir cuentas personales, corporativas o ambas y política de tenants. Su correo puede faltar y no constituye identidad verificada; no debe usarse para asignar permisos o vincular cuentas. Diferir su activación mantiene acotada la primera versión. Si se activa posteriormente, exigir diseño de vinculación explícita con reautenticación de ambas identidades.

Fuentes verificadas para proveedores:
- https://better-auth.com/docs/authentication/google
- https://better-auth.com/docs/authentication/microsoft
- https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/users-accounts.mdx
- https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/session-management.mdx

### Identidades y sesiones

Usuario interno independiente del correo. Índice único de identidad (providerId, accountId) y unicidad de correo según contrato del adaptador; un conflicto de correo no fusiona usuarios ni permisos. Crear usuario y perfil Pendiente de forma consistente e idempotente. Rol ausente o desconocido deniega acceso. Ningún campo de rol se acepta desde formularios de registro ni del perfil OAuth.

Sesión persistente de 7 días y cierre revocable en servidor; cookies HttpOnly, Secure en producción y SameSite apropiado al flujo OAuth. Deshabilitar caché de sesión en cookie. Cada operación protegida consulta sesión válida y perfil de permisos actual desde servidor; solo deduplicación dentro de una petición. No cachear respuestas privadas entre usuarios. Proteger mutaciones con controles de origen/CSRF del framework y librería, métodos apropiados y validación de entradas. Redirecciones internas permitidas explícitamente, nunca URLs arbitrarias.

### Modelo y patrones de acceso

MongoDB nuevo, sin reutilizar bases antiguas. Requiere replica set o Atlas con transacciones, incluso en pruebas de integración. El MCP continúa de solo lectura; no se utiliza para aprovisionar datos.

| Colección | Datos y acceso | Índices previstos |
| --- | --- | --- |
| user/account/session/verification del adaptador | Identidad y sesión según esquema oficial; no duplicar sus contratos manualmente | Índices exigidos por adaptador y unicidad proveedor/cuenta |
| portalProfiles | userId único, role (pending/user/admin), roleVersion, createdAt, lastLoginAt, lastDashboardAt, dashboardAccessTotal | userId único; role + createdAt + userId para listado |
| accessEvents | eventId, userId, type (sign_in/dashboard_entry), occurredAt UTC, expiresAt | eventId único; type + occurredAt; type + userId + occurredAt; TTL expiresAt |
| roleAudit | actorId o system:bootstrap, targetId, before, after, occurredAt, expiresAt | targetId + occurredAt; TTL expiresAt |
| accessControlState | singleton con bootstrapCompleted, adminCount, version | _id único |

Los eventos no se incrustan en usuarios. Perfil mantiene resumen histórico exacto para listado, aun cuando expire el detalle. Transacción de entrada: insertar eventId único e incrementar contador/última fecha; un reintento del mismo eventId no incrementa otra vez. Inicio de sesión se registra una vez por creación de sesión derivada del callback OAuth, con idempotencia asociada a esa sesión; no por renovación. La UI solo recibe DTO con campos necesarios, jamás account/session completos.

Buscar nombres y correos con texto acotado, regex escapada y límites; para volumen inicial se acepta filtrado no indexado por subcadena, documentando el coste. Páginas de 25, máximo 100, orden determinista y cursor. Validar rol, id y rango; no aceptar operadores MongoDB del cliente.

### Primer administrador y concurrencia

Un script privado ejecutado por operador toma el id interno de una cuenta Google ya registrada, verifica identidad y promueve esa cuenta en una transacción. No usar correo como contraseña de bootstrap ni promover automáticamente al primero que se registre. No guardar identificadores personales en Git. El singleton marca bootstrapCompleted de forma atómica, impidiendo repeticiones. El script no se expone por HTTP.

Todo cambio de rol lee el perfil actor y objetivo y modifica el singleton dentro de la misma transacción, serializando decisiones y reintentando conflictos con límite. Degradar admin requiere adminCount mayor a uno; elevar incrementa ese valor. Verificar roleVersion del objetivo para evitar sobreescrituras de formularios obsoletos. Un cambio simultáneo del actor entra en conflicto por la misma serialización, de modo que no puede seguir asignando roles tras perder su permiso. Auditoría y cambio se confirman juntos. Permitir cambios propios siempre que no se elimine el último admin. No hay eliminación de usuarios.

### Rutas y navegación

| Ruta u operación | Sin sesión | Pendiente | Usuario | Administrador |
| --- | --- | --- | --- | --- |
| / | Login | Redirige /pending | Redirige /dashboard | Redirige /dashboard |
| /pending | Redirige / | Mensaje y logout | Redirige /dashboard | Redirige /dashboard |
| /dashboard | Redirige / | Redirige /pending | Permitido | Permitido |
| /users y /users/activity | Redirige / | 403 | 403 | Permitido |
| Consultar usuarios, estadísticas o cambiar rol | 401 | 403 | 403 | Permitido con validación |

Usar Server Components para datos y autorización. Formularios administrativos mediante Server Actions con controles completos; auth mediante Route Handler. Cliente limitado a botón OAuth, controles y visualización interactiva. Navegación del dashboard incluye cierre de sesión y, para admin, Usuarios. La etiqueta de /users será Usuarios; todas las fechas se muestran en español.

### Entradas al dashboard y gráfica

La unidad es una navegación real autorizada, no un inicio de sesión. Para la primera versión, toda navegación del portal a /dashboard fuerza una carga de documento mediante enlace normal sin prefetch; evitar router.push/Link para esta ruta. Registrar en la frontera de petición del documento y deduplicar el procesamiento por petición, antes de confirmar respuesta protegida. Generar eventId en servidor y propagarlo únicamente dentro de esa petición. Recargar genera otro id. RSC/prefetch y recursos no escriben eventos; el contenido protegido sigue exigiendo autorización también en esas peticiones.

Validar el comportamiento con Next.js real: metadatos de navegación, request-scoped memoization y pruebas de precarga, recarga, streaming y reintento. El conteo mide entradas autorizadas por servidor; una respuesta abandonada por el navegador puede quedar contada. No mide tiempo de lectura. Si falla la transacción de registro, mostrar error recuperable y no confirmar el dashboard. No usar useEffect para contar: duplicaría o perdería eventos, y fallaría sin JavaScript.

/users/activity presenta gráfica diaria SVG accesible con tabla equivalente, sin nueva librería de gráficos para esta serie simple. Rango inicial 30 días; límite 365 días y restricción por retención real. Filtros por usuario opcional en URL. Consultas agregan solo dashboard_entry, convierten bordes de día America/Mexico_City a UTC y rellenan días vacíos. Totales y usuarios únicos pertenecen al período, mientras el acumulado por perfil es histórico. Resultado vacío equivale a cero, no a fallo. Errores de consulta muestran estado de error, no cero.

Detalle e inicios de sesión: TTL 365 días. Auditoría: TTL 730 días. TTL no borra inmediatamente: las consultas excluyen expiresAt vencido explícitamente. No guardar IP, user agent o secretos. Retención configurable posteriormente mediante cambio documentado; no hay exportación ni eliminación en este alcance.

### Configuración y validación

.env.example solo enumera placeholders: MONGODB_URI, MONGODB_DB, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET. Configuración real privada y validada al ejecutar operaciones; URL productiva y orígenes de confianza explícitos. Ausencia de configuración deshabilita el botón con estado claro. No exigir servicios durante build.

Pruebas unitarias para matriz, validación y fechas; integración sobre replica set aislado para índices, transacciones, idempotencia y concurrencia; Playwright para UI y rutas. Proveedor OAuth simulado solo en proceso de pruebas con imposibilidad de activarlo en producción; completar además prueba manual Google real con credenciales privadas cuando estén disponibles. No presentar mocks como validación OAuth real.

## Risks / Trade-offs

- Dependencia nueva y compatibilidad Node 26 → fijar versiones tras comprobar paquetes y ejecutar build e integración; no instalar versiones beta para resolverlo.
- MongoDB obligatorio en operación → estado controlado sin permisos por defecto; pool reutilizado y pruebas de caída. Requiere transacciones y replica set.
- Precargas y renderizados de Next.js → navegación de documento explícita y prueba de conteo real; coste de recarga completa aceptado en este portal pequeño.
- Retención limitada → distinguir acumulados históricos y detalle disponible; no inferir estadísticas anteriores al período retenido.
- Escaneo de búsqueda por subcadena → límites y paginación para el volumen inicial, medir antes de agregar infraestructura de búsqueda.

## Migration Plan

1. Implementar en master las tareas, sin publicar; actualizar AGENTS.md, README y contexto OpenSpec para sustituir restricciones antiguas cuando el comportamiento se implemente, sin cambiar el playbook global.
2. Preparar base nueva con índices/validadores y replica set; registrar cliente Google y variables en entorno privado. No modificar servicios mediante MCP de lectura.
3. Validar sin credenciales el build y el estado deshabilitado; con entorno aislado ejecutar flujos, concurrencia, permisos y conteo. Registrar qué pruebas reales Google se completaron.
4. Operador registra su identidad como Pendiente y ejecuta bootstrap privado; confirmar admin y probar otra cuenta Pendiente antes de cualquier publicación solicitada.
5. Una publicación futura conservará destino Vercel y requerirá una solicitud independiente. Rollback ante fallo de permisos: cerrar acceso al portal y revertir a una versión protegida validada; no volver a servir automáticamente el dashboard público. Conservar datos para diagnóstico; no borrar colecciones automáticamente.

## Open Questions

Antes de validar OAuth real se necesitan origen final, proyecto OAuth y acceso privado a una base nueva con transacciones. El operador elegirá el id registrado para bootstrap. Son datos operativos pendientes; no bloquean esta propuesta ni requieren compartir secretos por chat. Microsoft necesitará una solicitud posterior con su política de cuentas y vinculación.
