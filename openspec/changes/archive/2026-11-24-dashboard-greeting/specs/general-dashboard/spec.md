# Spec Delta

## MODIFIED Requirements

### Requirement: Pantalla inicial única
La aplicación SHALL servir el inicio de sesión en `/` y una pantalla protegida en `/dashboard` cuyo contenido principal sea un encabezado de nivel uno con el saludo `Hola, {nombre}`, donde `{nombre}` es el nombre de la cuenta Google de la sesión autenticada, con navegación según rol y cierre de sesión. Si la sesión no aporta un nombre utilizable, el encabezado SHALL ser `Hola`.

#### Scenario: Visita a la raíz
- **WHEN** una persona sin sesión solicita `/`
- **THEN** recibe una respuesta HTTP 200 con el inicio de sesión mediante Google
- **AND** no recibe datos protegidos ni indicadores de negocio

#### Scenario: Dashboard autorizado con nombre
- **WHEN** una cuenta Usuario o Administrador llamada `Ana Pérez` entra a `/dashboard`
- **THEN** recibe el encabezado `Hola, Ana Pérez` sin funcionalidades de negocio adicionales

#### Scenario: Dashboard autorizado sin nombre
- **WHEN** una cuenta Usuario o Administrador sin nombre disponible entra a `/dashboard`
- **THEN** recibe el encabezado `Hola` sin texto adicional
