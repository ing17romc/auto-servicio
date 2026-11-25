# Proposal

## Why

El portal solo muestra un dashboard público y no distingue usuarios ni permisos. Se necesita identificar a las personas con Google, autorizar su acceso y permitir que los administradores gestionen permisos y consulten el uso del dashboard.

## What Changes

- **BREAKING**: `/` pasa de dashboard público a inicio de sesión; el título actual se conserva en `/dashboard`, protegido por autorización.
- Incorporar Google, sesiones persistentes y roles Pendiente, Usuario y Administrador; las cuentas nuevas quedan pendientes.
- Crear `/pending`, `/users` y `/users/activity`, con autorización en servidor y cambios de rol auditados.
- Registrar inicios de sesión y entradas al dashboard por separado; ofrecer gráfica diaria, filtros y tabla.
- **BREAKING**: la operación autenticada requiere MongoDB y configuración OAuth. El build sigue siendo posible sin credenciales.
- Evaluar Microsoft y dejarlo fuera de la primera implementación; no introducir contraseñas propias ni vinculación automática por correo.

## Capabilities

### New Capabilities

- `social-auth`: identidad externa, sesión, registro y estados de autenticación.
- `user-access-management`: autorización, administración de roles y bootstrap del primer administrador.
- `dashboard-access-analytics`: eventos de acceso y consulta administrativa de estadísticas.

### Modified Capabilities

- `general-dashboard`: trasladar la pantalla a `/dashboard` y exigir un rol autorizado; conservar las rutas heredadas retiradas.
- `application-runtime`: habilitar persistencia y autenticación en servidor, separar build y operación configurada y actualizar idioma y metadatos.

## Impact

Se modificarán app/page.js, app/layout.js y documentación; se agregarán rutas App Router, módulos server-only en backend/ y componentes de autenticación y estadísticas. Se propone Better Auth con adaptador MongoDB y driver oficial; Express y Mongoose no necesitan activarse. El diseño precisa contratos, requisitos externos y validaciones; no se instala ninguna dependencia ni se conecta a servicios en esta etapa.

Aceptación: un pendiente no ve datos protegidos; un usuario solo ve el dashboard; un administrador gestiona usuarios y estadísticas; una degradación afecta la siguiente operación de sesiones existentes; recargas cuentan y precargas no; el último administrador queda protegido ante concurrencia. No se modifica el remoto ni el destino Vercel y no se despliega.
