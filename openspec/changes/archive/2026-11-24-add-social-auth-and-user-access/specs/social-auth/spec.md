# Spec Delta

## Purpose

Identificar a las personas mediante proveedores externos y mantener sesiones seguras sin contraseñas propias del portal.

## ADDED Requirements

### Requirement: Inicio de sesión con Google
El portal SHALL ofrecer Google en `/`, verificar la identidad externa en servidor y crear una identidad interna estable con rol Pendiente en el primer acceso exitoso. No SHALL ofrecer contraseñas propias.

#### Scenario: Registro y regreso
- **WHEN** una identidad Google válida completa su primer inicio y posteriormente vuelve a iniciar sesión
- **THEN** existe un único usuario interno con fecha de registro y proveedor
- **AND** el segundo inicio conserva su identificador, rol y estadísticas

#### Scenario: Identidad no válida
- **WHEN** falla la validación del proveedor o el usuario cancela
- **THEN** no se concede sesión ni acceso protegido y se muestra un error recuperable sin secretos

### Requirement: Vinculación segura
El portal SHALL identificar cuentas por proveedor e identificador estable, rechazar duplicados concurrentes y deshabilitar la vinculación automática por coincidencia de correo.

#### Scenario: Correo coincidente
- **WHEN** una identidad distinta presenta el correo de una cuenta existente
- **THEN** no obtiene su identidad interna ni sus permisos y recibe un conflicto recuperable

### Requirement: Sesión y navegación por rol
El portal SHALL mantener una sesión persistente revocable y redirigir desde `/` a `/pending` para Pendiente y a `/dashboard` para Usuario o Administrador.

#### Scenario: Cuenta pendiente
- **WHEN** una cuenta Pendiente inicia sesión
- **THEN** ve «Tu cuenta se creó correctamente. Un administrador debe habilitar tu acceso al portal.» y una opción de cerrar sesión
- **AND** no recibe datos de usuarios, estadísticas ni dashboard

#### Scenario: Expiración o cierre
- **WHEN** la sesión vence o la persona cierra sesión
- **THEN** la siguiente operación protegida requiere autenticación y los datos protegidos no se reutilizan desde una caché compartida

### Requirement: Estados accesibles
El portal SHALL presentar en español estados de carga, error y ausencia de datos, con controles accesibles por teclado y sin desbordamiento a 320 píxeles.

#### Scenario: Error de autenticación en móvil
- **WHEN** falla el inicio de sesión en un viewport de 320 píxeles
- **THEN** se muestra un mensaje legible, el foco permite reintentar y no hay desplazamiento horizontal
