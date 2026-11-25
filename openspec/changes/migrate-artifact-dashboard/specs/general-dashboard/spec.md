# Spec Delta

## MODIFIED Requirements

### Requirement: Pantalla inicial única
La aplicación SHALL servir el inicio de sesión en `/` y una pantalla protegida en `/dashboard` cuyo contenido principal sea el dashboard de venta e inventario definido en `sales-inventory-dashboard`, con navegación según rol y cierre de sesión. La pantalla SHALL NOT mostrar el saludo `Hola, {nombre}` como contenido principal.

#### Scenario: Visita a la raíz
- **WHEN** una persona sin sesión solicita `/`
- **THEN** recibe una respuesta HTTP 200 con el inicio de sesión mediante Google
- **AND** no recibe datos protegidos ni indicadores de negocio

#### Scenario: Dashboard autorizado con nombre
- **WHEN** una cuenta Usuario o Administrador llamada `Ana Pérez` entra a `/dashboard`
- **THEN** recibe la navegación del portal y el dashboard de venta e inventario
- **AND** no se muestra el saludo `Hola, Ana Pérez` como encabezado principal

#### Scenario: Dashboard autorizado sin nombre
- **WHEN** una cuenta Usuario o Administrador sin nombre disponible entra a `/dashboard`
- **THEN** recibe la navegación del portal y el dashboard de venta e inventario
- **AND** no se muestra `Hola` como encabezado principal

### Requirement: Acceso público independiente de servicios externos
El inicio de sesión SHALL ser visible sin sesión previa. El dashboard SHALL requerir sesión válida y rol Usuario o Administrador, y los errores de configuración externa SHALL mostrar un estado controlado sin conceder acceso.

#### Scenario: Navegador sin sesión y sin servicios configurados
- **WHEN** una persona abre `/` sin sesión ni configuración de MongoDB o Google
- **THEN** ve el inicio de sesión con un estado de servicio no disponible y sin bucles de redirección
- **AND** no se intenta acceso desde el navegador a MongoDB ni se muestra información sensible

#### Scenario: Cuenta pendiente
- **WHEN** una cuenta Pendiente solicita `/dashboard`
- **THEN** se redirige a `/pending` sin entregar el dashboard ni sus datos

### Requirement: Presentación mínima accesible
La pantalla SHALL exponer un único encabezado de nivel uno con el título del dashboard, legible y sin desbordamiento horizontal de la página en tamaños de pantalla de escritorio y móvil. Las tablas anchas SHALL desplazarse dentro de su propio contenedor.

#### Scenario: Consulta desde un dispositivo móvil
- **WHEN** se abre `/dashboard` con un viewport de 320 píxeles de ancho
- **THEN** la página no tiene desplazamiento horizontal y existe un único encabezado de nivel uno con el título del dashboard
- **AND** las tablas anchas se desplazan dentro de su contenedor
