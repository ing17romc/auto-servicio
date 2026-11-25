# general-dashboard Specification

## Purpose

Definir la pantalla inicial mínima del nuevo producto y su acceso público, retirando las interfaces y endpoints de la aplicación anterior.

## Requirements

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

### Requirement: Acceso público independiente de servicios externos
El inicio de sesión SHALL ser visible sin sesión previa. El dashboard SHALL requerir sesión válida y rol Usuario o Administrador, y los errores de configuración externa SHALL mostrar un estado controlado sin conceder acceso.

#### Scenario: Navegador sin sesión y sin servicios configurados
- **WHEN** una persona abre `/` sin sesión ni configuración de MongoDB o Google
- **THEN** ve el inicio de sesión con un estado de servicio no disponible y sin bucles de redirección
- **AND** no se intenta acceso desde el navegador a MongoDB ni se muestra información sensible

#### Scenario: Cuenta pendiente
- **WHEN** una cuenta Pendiente solicita `/dashboard`
- **THEN** se redirige a `/pending` sin entregar el dashboard

### Requirement: Retiro de rutas heredadas
La aplicación SHALL mantener HTTP 404 para las rutas de negocio y las 13 APIs retiradas. Solo las rutas nuevas documentadas para autenticación, dashboard y administración sustituyen la restricción de pantalla única; ninguna reutiliza lógica heredada.

#### Scenario: Visita a una pantalla eliminada
- **WHEN** se solicita una pantalla de Walmart, Cero Humedad o una ruta auxiliar heredada fuera de las nuevas rutas declaradas
- **THEN** se recibe HTTP 404 sin ejecutar lógica heredada

#### Scenario: Solicitud a una API eliminada
- **WHEN** se solicita una antigua ruta API con un método que antes atendía
- **THEN** se recibe HTTP 404 sin ejecutar lógica de negocio ni acceder a datos

### Requirement: Presentación mínima accesible
La pantalla SHALL exponer el título como encabezado semántico legible y sin desbordamiento horizontal en tamaños de pantalla de escritorio y móvil.

#### Scenario: Consulta desde un dispositivo móvil
- **WHEN** se abre la pantalla con un viewport de 320 píxeles de ancho
- **THEN** se puede leer el saludo `Hola, {nombre}` (o `Hola` sin nombre disponible) sin desplazamiento horizontal y existe un único encabezado de nivel uno
