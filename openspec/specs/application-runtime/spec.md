# application-runtime Specification

## Purpose

Garantizar que la base nueva pueda instalarse, ejecutarse y compilarse de forma reproducible para Vercel sin depender de los servicios retirados.

## Requirements

### Requirement: Runtime compatible con Vercel
El proyecto SHALL declarar y usar Node.js 26.x, soportado por Vercel, y una versión estable de Next.js compatible. Las versiones elegidas SHALL quedar registradas para reproducir el entorno.

#### Scenario: Preparación del entorno
- **WHEN** se configura el proyecto para desarrollo o construcción
- **THEN** se utiliza Node.js 26.x y la versión estable de Next.js fijada en el proyecto
- **AND** no se seleccionan versiones canary ni experimentales

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

### Requirement: Configuración sin secretos versionados
La base resultante SHALL excluir archivos de entorno reales del seguimiento de Git y ofrecer un ejemplo sin credenciales. Los secretos SHALL estar ausentes del HTML y de los recursos enviados al navegador.

#### Scenario: Inspección del estado resultante
- **WHEN** se revisan el árbol versionado y la salida del build después de la limpieza
- **THEN** no se incluye `.env.local` en el árbol vigente ni valores de credenciales en el ejemplo o en los recursos públicos
- **AND** este requisito no implica reescribir commits anteriores

### Requirement: Continuidad del repositorio y del destino de despliegue
El cambio SHALL conservar el historial y remoto existentes de GitHub y permitir construir en el proyecto Vercel existente sin crear otro repositorio ni otro proyecto de alojamiento.

#### Scenario: Preparación de una futura publicación
- **WHEN** se prepara el build con el preset de Next.js, la raíz del repositorio y Node.js 26.x
- **THEN** se usa el mismo repositorio y destino Vercel existente
- **AND** la limpieza local no publica automáticamente ni modifica recursos externos

### Requirement: Renderizado inicial desde servidor
La pantalla autorizada SHALL entregar el saludo `Hola, {nombre}` (o `Hola` cuando no haya nombre disponible) en el HTML inicial, sin enviar Express, Mongoose, el driver MongoDB ni secretos al navegador. El documento SHALL declarar idioma español y metadatos apropiados por página.

#### Scenario: Solicitud sin JavaScript
- **WHEN** un usuario autorizado solicita `/dashboard` con JavaScript deshabilitado
- **THEN** puede leer el encabezado con el saludo, el documento tiene idioma español y título `General Dashboard`, y no hay dependencias de backend en los recursos cliente
