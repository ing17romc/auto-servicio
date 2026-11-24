# Auto-Servicio

Portal Next.js App Router con acceso Google, autorización por roles y estadísticas de entradas al dashboard. Trabajar directamente en `master`. No se ha publicado este cambio.

## Preparación

Usar Node.js 26.13.1, fijado en `.nvmrc`, antes de cualquier comando npm:

```powershell
nvm use 26.13.1
node --version
npm ci
npm run dev
```

Si no hay nvm, usar un runtime aislado con su directorio al principio de PATH. En Windows el wrapper global npm.ps1 puede usar su Node adyacente: ejecutar `node RUTA_A_NPM/npm-cli.js <argumentos>` con el binario Node 26 explícito en ese caso.

Sin configuración privada, `/` muestra el login deshabilitado y un mensaje claro. Instalación y `npm run build` no necesitan base ni credenciales. No hay contraseñas propias, Firebase, MySQL ni lógica heredada. Express y Mongoose siguen instalados e inactivos.

## Configuración privada

Copiar `.env.example` a `.env.local` y completar sin versionar sus valores:

| Variable | Uso |
| --- | --- |
| MONGODB_URI | URI privada de una base nueva; replica set o Atlas con transacciones |
| MONGODB_DB | Nombre exclusivo de la base del portal |
| BETTER_AUTH_URL | Origen exacto: http://localhost:3000 en local; HTTPS en producción |
| BETTER_AUTH_SECRET | Secreto aleatorio de al menos 32 caracteres; no usar un ejemplo fijo |
| GOOGLE_CLIENT_ID | Cliente OAuth web de Google |
| GOOGLE_CLIENT_SECRET | Secreto privado de ese cliente |

Crear/configurar el cliente en Google Cloud y su pantalla de consentimiento. En modo de prueba agregar las cuentas autorizadas para probar. Registrar las redirecciones exactas:

- Local: `http://localhost:3000/api/auth/callback/google`.
- Producción: el origen real seguido de `/api/auth/callback/google`.

Solo se solicitan identidad básica, perfil y correo; no permisos de Gmail/Drive. No se guardan tokens de acceso, refresh ni ID tokens del proveedor. Vincular cuentas automáticamente por correo está deshabilitado. Una coincidencia de correo con otra identidad se rechaza. Microsoft está evaluado en el diseño y queda fuera de esta versión.

Ver [Google en Better Auth](https://better-auth.com/docs/authentication/google) y [Microsoft](https://better-auth.com/docs/authentication/microsoft).

Preparar colecciones, validadores e índices de forma explícita después de configurar una base nueva:

```powershell
npm run db:setup
```

El script carga `.env.local` y es idempotente. No borra colecciones. Puede fallar ante índices existentes incompatibles o permisos insuficientes: revisar la base seleccionada, sin eliminar datos automáticamente. La aplicación no modifica índices desde el build.

## Roles y rutas

| Rol | Acceso |
| --- | --- |
| Pendiente (pending) | `/pending`, mensaje de aprobación pendiente y cierre de sesión |
| Usuario (user) | `/dashboard` |
| Administrador (admin) | Dashboard, `/users`, `/users/activity` y asignación de roles |

`/` es el login y redirige según el rol cuando ya hay sesión. Toda cuenta nueva inicia Pendiente. Cada operación protegida verifica sesión persistida y rol actual. Un cambio de rol afecta la siguiente operación, incluidas sesiones abiertas. Cookies HttpOnly y SameSite=Lax, Secure en HTTPS; sesiones de siete días, revocables y sin caché de sesión en cookie. La navegación interna usa cargas de documento para revalidar permisos y registrar entradas.

Las operaciones administrativas responden 401 sin sesión y 403 sin permiso antes de ejecutarse. Cada Server Action revalida identidad, origen y entradas; el cambio de rol comprueba también la sesión y rol del actor dentro de la transacción. No hay edición pública de perfiles, vinculación, eliminación ni endpoints de contraseñas.

`/users` permite buscar por nombre/correo, filtrar rol, paginar y asignar permisos. Muestra proveedor, registro, último login, último acceso y entradas acumuladas. El último administrador no puede degradarse. Cambios concurrentes se serializan y se auditan en la misma transacción.

### Primer administrador

1. Preparar MongoDB y Google como se indica arriba.
2. Iniciar sesión con la cuenta Google del operador: quedará Pendiente.
3. Consultar de forma privada su usuario interno en la colección `user`, verificando la relación en `account` con providerId `google`. El identificador interno es `_id`, no el correo ni el identificador externo.
4. Ejecutar en terminal privada:

```powershell
npm run admin:bootstrap -- ID_INTERNO_REGISTRADO
```

El script promueve exactamente esa cuenta, registra actor `system:bootstrap` y bloquea repeticiones. No tiene endpoint público. Volver a `/` para acceder. Los administradores siguientes se asignan desde Usuarios. No enviar credenciales o datos personales por chat ni guardarlos en el repositorio.

## Persistencia y actividad

- `user`, `account`, `session`, `verification`: datos del adaptador de autenticación; identidad interna independiente del correo.
- `portalProfiles`: rol, versión, fechas y contador acumulado. No se aceptan roles del proveedor ni del cliente durante registro.
- `accessEvents`: eventos `sign_in` y `dashboard_entry`, fecha UTC y usuario. Detalle por 365 días.
- `roleAudit`: actor, objetivo, rol anterior/nuevo y fecha. Retención de 730 días.
- `accessControlState`: control transaccional del primer/último administrador.

Los eventos no contienen cookies, tokens, IP ni user agent. El perfil conserva contador y última fecha aun cuando expire el detalle. TTL se ejecuta de forma asíncrona; las consultas excluyen eventos vencidos aunque todavía no se hayan eliminado físicamente.

Una entrada significa una navegación de documento autorizada a `/dashboard`. Cada recarga cuenta. Recursos, RSC, precargas y accesos denegados no cuentan. Un reintento técnico con el mismo identificador no duplica el evento ni el contador. Una respuesta abandonada por el navegador puede quedar contada: no mide lectura ni duración. Si falla el registro, se devuelve un estado de servicio no disponible antes de confirmar el dashboard.

`/users/activity` muestra gráfica diaria accesible, tabla equivalente, total del período y usuarios únicos, con filtros por fechas y usuario. Rango inicial de 30 días, con fechas y agrupación en America/Mexico_City; se admiten días completos dentro de la retención disponible. Los totales del período no son el acumulado histórico. Los errores de consulta se muestran como errores, nunca como ceros.

El pool parte de cinco conexiones por proceso/instancia, cero mínimas y 30 segundos de inactividad, para el portal inicial en Vercel. Timeouts de selección/conexión/cola de cinco segundos y operaciones/transacciones de diez segundos. Son valores iniciales; medir latencia, concurrencia, colas, conexiones de Atlas y cantidad de instancias antes de ajustarlos. No cerrar el cliente por petición.

## Validación

```powershell
npm run lint
npm run build
npm test
npm run test:e2e
npm run openspec -- validate --all --strict
```

`npm test` crea un replica set temporal MongoDB 8.2.3 y elimina solamente ese entorno al terminar. Primera ejecución descarga el binario MongoDB en caché local (Windows: aproximadamente 780 MB). Prueba OAuth Google simulado con firmas RSA, estado y cookies reales de la librería, concurrencia, roles, auditoría y estadísticas. El mock existe exclusivamente en archivos de pruebas; no hay variable para habilitarlo en producción.

`test:e2e` requiere Google Chrome instalado y un build previo. Inicia el build en puerto 3137 con otra base temporal y cuentas sintéticas, usa Chrome headless mediante Playwright y cierra procesos al terminar. Valida login, pendiente, dashboard sin JavaScript, administración, cambio efectivo de rol, gráfica, móvil, 401/403, conteo y cierre/revocación. Estas pruebas nunca usan una base real ni sustituyen la validación manual del proveedor Google con credenciales privadas.

El inventario retirado conserva 404 en sus rutas de negocio y APIs; las rutas nuevas de arriba no restauran funcionalidades anteriores.

## Organización y herramientas

- `app/`: rutas, Server Actions y estilos; Server Components por defecto.
- `backend/auth/`: Better Auth y lectura de identidad; `backend/db/`: cliente y preparación; `backend/portal.mjs`: operaciones del dominio.
- `proxy.js`: autorización previa al render y registro de entrada por documento.
- `components/`: navegación, controles de sesión/roles y gráfica.
- `tests/`: pruebas puras, integración y navegador sobre datos sintéticos.
- `tools/mcp/`: herramientas del asistente aisladas del backend. Preparar con `npm run mcp:setup`.

Context7, Playwright y MongoDB de solo lectura mantienen sus configuraciones `.mcp.json` y `.codex/config.toml`. Las credenciales del asistente son diferentes de las credenciales de la aplicación; no imprimirlas ni reutilizarlas como URI de la base nueva. Las 13 skills se conservan sin cambios: `npm run skills:check` verifica hashes y paridad.

## Publicación y recuperación

Conservar remoto GitHub y proyecto Vercel existentes. No se hace push ni deploy como parte de implementar. Una publicación posterior debe revisar variables privadas, callbacks Google, Node 26.x, preset Next.js, raíz y comandos del proyecto Vercel existente.

Si falla la autorización en una publicación futura, cerrar temporalmente el acceso y volver a una versión protegida validada; no restaurar automáticamente el dashboard público. Conservar la base para diagnóstico sin borrar usuarios ni eventos.
