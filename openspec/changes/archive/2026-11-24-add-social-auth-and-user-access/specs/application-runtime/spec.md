# Spec Delta

## MODIFIED Requirements

### Requirement: Instalación y ejecución reproducibles
El proyecto SHALL permitir instalar con `npm ci`, iniciar con `npm run dev`, compilar con `npm run build` y servir con `npm start` bajo Node.js 26.x. Instalación y build no SHALL necesitar credenciales ni acceso a MongoDB; las operaciones autenticadas SHALL exigir configuración válida en ejecución.

#### Scenario: Arranque desde una instalación limpia
- **WHEN** se instala y compila el proyecto con Node.js 26.x sin credenciales externas
- **THEN** instalación y compilación terminan correctamente y el servidor sirve `/` con un estado controlado de autenticación no configurada

#### Scenario: Operación configurada
- **WHEN** se configura Google, secreto de sesión, origen y MongoDB disponible
- **THEN** el servidor permite autenticar, persistir usuarios y aplicar permisos

### Requirement: Independencia de las integraciones retiradas
La aplicación SHALL funcionar sin Firebase, MySQL ni interfaz heredada. La autenticación y los datos SHALL ejecutarse en servidor mediante App Router y MongoDB, sin iniciar un servidor Express separado ni enviar dependencias de backend al navegador.

#### Scenario: Operación con servicios externos ausentes
- **WHEN** MongoDB o Google no están disponibles
- **THEN** las operaciones dependientes fallan de forma controlada sin conceder permisos ni intentar integraciones retiradas

#### Scenario: Dependencias de backend disponibles
- **WHEN** se importan Express y Mongoose después de una instalación limpia
- **THEN** ambas dependencias se resuelven sin iniciar servidores y permanecen inactivas salvo necesidad explícita de otra funcionalidad

### Requirement: Renderizado inicial desde servidor
La pantalla autorizada SHALL entregar el saludo `Hola, {nombre}` (o `Hola` cuando no haya nombre disponible) en el HTML inicial, sin enviar Express, Mongoose, el driver MongoDB ni secretos al navegador. El documento SHALL declarar idioma español y metadatos apropiados por página.

#### Scenario: Solicitud sin JavaScript
- **WHEN** un usuario autorizado solicita `/dashboard` con JavaScript deshabilitado
- **THEN** puede leer el encabezado con el saludo, el documento tiene idioma español y título `General Dashboard`, y no hay dependencias de backend en los recursos cliente
