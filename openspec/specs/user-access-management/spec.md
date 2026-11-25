# user-access-management Specification

## Purpose

Controlar el acceso del portal y permitir la asignación administrativa de roles de forma verificable y auditable.

## Requirements

### Requirement: Autorización por rol en servidor
El portal SHALL aplicar en cada operación protegida los roles Pendiente, Usuario y Administrador. Usuario y Administrador acceden a `/dashboard`; solo Administrador accede a `/users`, `/users/activity` y sus operaciones. Pendiente solo accede a su estado y cierre de sesión.

#### Scenario: Acceso directo sin permiso
- **WHEN** un Usuario o Pendiente solicita datos administrativos o intenta cambiar un rol directamente
- **THEN** el servidor responde 403 sin datos ni efectos

#### Scenario: Sesión ausente
- **WHEN** una persona sin sesión solicita una página protegida o una operación administrativa
- **THEN** la página redirige a `/` y la operación responde 401

#### Scenario: Permisos actualizados
- **WHEN** un administrador cambia el rol de una cuenta con sesión abierta
- **THEN** su siguiente operación protegida utiliza el rol actualizado
- **AND** un rol desconocido se trata como acceso denegado

### Requirement: Listado administrativo
La página `/users` SHALL mostrar nombre, correo, foto disponible, proveedor, rol, registro, último inicio de sesión, último acceso al dashboard y total acumulado de accesos, con búsqueda por nombre o correo, filtro por rol y paginación.

#### Scenario: Filtrado y vacío
- **WHEN** un administrador busca y filtra usuarios
- **THEN** recibe únicamente coincidencias paginadas, con fechas en America/Mexico_City y valores vacíos identificados
- **AND** una búsqueda sin resultados presenta un estado vacío

### Requirement: Asignación auditada de roles
Un Administrador SHALL poder asignar Pendiente, Usuario o Administrador. El sistema SHALL validar el rol y registrar usuario afectado, actor, fecha y valores anterior y nuevo antes de confirmar el cambio.

#### Scenario: Cambio válido
- **WHEN** un administrador habilita una cuenta Pendiente como Usuario
- **THEN** el cambio y su auditoría quedan confirmados conjuntamente y la cuenta puede entrar al dashboard

#### Scenario: Entrada inválida o conflicto
- **WHEN** se envía un rol inválido, un usuario inexistente o una versión de rol obsoleta
- **THEN** se rechaza la operación sin modificación parcial ni auditoría de éxito

### Requirement: Primer y último administrador
El sistema SHALL habilitar el primer administrador mediante un procedimiento privado operado fuera de la interfaz pública y SHALL impedir que cambios concurrentes dejen el portal sin administradores. No existe eliminación de usuarios en esta versión.

#### Scenario: Bootstrap controlado
- **WHEN** el operador selecciona una identidad Google previamente registrada y ejecuta el procedimiento privado por primera vez
- **THEN** se promueve exactamente esa cuenta, se registra el actor de sistema y el procedimiento no puede repetirse como autoasignación pública

#### Scenario: Degradaciones concurrentes
- **WHEN** dos administradores intentan degradar las últimas cuentas administrativas simultáneamente
- **THEN** al menos un administrador permanece y la operación incompatible se rechaza sin cambios parciales
