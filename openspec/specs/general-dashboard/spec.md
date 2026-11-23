# general-dashboard Specification

## Purpose

Definir la pantalla inicial mínima del nuevo producto y su acceso público, retirando las interfaces y endpoints de la aplicación anterior.

## Requirements

### Requirement: Pantalla inicial única
La aplicación SHALL servir en `/` una única pantalla de producto cuyo único contenido visible sea un encabezado de nivel uno con el texto exacto `General Dashboard`.

#### Scenario: Visita a la raíz
- **WHEN** una persona solicita `/`
- **THEN** recibe una respuesta HTTP 200 y el encabezado `General Dashboard`
- **AND** no se muestran menús, formularios, gráficos, indicadores ni texto adicional

### Requirement: Acceso público independiente de servicios externos
La pantalla SHALL abrirse sin autenticación, cookies previas, credenciales ni conexión con bases de datos o servicios de identidad.

#### Scenario: Navegador sin sesión y sin servicios configurados
- **WHEN** una persona abre `/` sin sesión y la aplicación carece de variables de Firebase, MySQL y MongoDB
- **THEN** la pantalla se muestra sin redirecciones a login ni errores de conexión
- **AND** no se realizan solicitudes desde el navegador a esos servicios

### Requirement: Retiro de rutas heredadas
La aplicación SHALL responder HTTP 404 a todas las antiguas rutas de interfaz distintas de `/` y a las 13 rutas API retiradas, incluidos sus métodos previamente disponibles.

#### Scenario: Visita a una pantalla eliminada
- **WHEN** se solicita una ruta de autenticación, Walmart, Cero Humedad o una de las rutas auxiliares anteriormente expuestas
- **THEN** se recibe HTTP 404 sin mostrar la pantalla ni redirigir al dashboard o al login

#### Scenario: Solicitud a una API eliminada
- **WHEN** se solicita una antigua ruta API con un método que antes atendía
- **THEN** se recibe HTTP 404 sin ejecutar lógica de negocio ni acceder a datos

### Requirement: Presentación mínima accesible
La pantalla SHALL exponer el título como encabezado semántico legible y sin desbordamiento horizontal en tamaños de pantalla de escritorio y móvil.

#### Scenario: Consulta desde un dispositivo móvil
- **WHEN** se abre la pantalla con un viewport de 320 píxeles de ancho
- **THEN** se puede leer `General Dashboard` sin desplazamiento horizontal y existe un único encabezado de nivel uno
